{
  pkgs,
  lib,
  config,
  ...
}:

let
  # fix locale
  use-locale = "C.UTF-8";
  custom-locales = pkgs.glibcLocalesUtf8.override {
    allLocales = false;
    locales = [ "${use-locale}/UTF-8" ];
  };

  # Build output and vendored code rather than source: index.html carries minified Leaflet and
  # Leaflet.markercluster inline, and the mappacks in maps/ are minified single-line JSON. The hooks
  # that rewrite whitespace or count columns would either mangle them or report noise, so they skip
  # these paths. index.html and sw.js become generated files once the TypeScript build lands.
  generated = [
    "^index\\.html$"
    "^sw\\.js$"
    "^maps/"
    "^assets/"
    "^workbox-.*\\.js$"
    "^pnpm-lock\\.yaml$"
  ];

  # This project's prose and data are German, Italian and Romansh place names. `typos` only has an
  # English dictionary, so on these files it reports ordinary German words as misspellings. It
  # stays enabled for everything we write ourselves.
  natural-language = [
    "^README\\.md$"
    "^manifest\\.webmanifest$"
    "^index\\.html$"
    "^maps/"
    # The German half of the interface texts, and the German for strings that arrive with the data.
    "^src/i18n/de\\.json$"
    "^src/i18n/dataTranslations\\.ts$"
    # Grade scales: "sax" (Saxon), "fin" (Finnish), "aus" (Australian).
    "^src/data/conv\\.json$"
    # The page description, in German, the same text as in manifest.webmanifest.
    "^src/index\\.html$"
    # German prose, like README.md.
    "^CONTRIBUTING\\.md$"
  ];
in
{
  env = {
    # set do not track (https://consoledonottrack.com/)
    DO_NOT_TRACK = 1;

    # Prevent corepack from downloading the "latest" pnpm; the version comes from the
    # "packageManager" field in package.json once that exists.
    COREPACK_DEFAULT_TO_LATEST = 0;

    # fix locale
    LOCALE_ARCHIVE = "${custom-locales}/lib/locale/locale-archive";
    LC_ALL = use-locale;
    LC_CTYPE = use-locale;
    LC_COLLATE = use-locale;
    LC_MESSAGES = use-locale;
    LC_NUMERIC = use-locale;
    LC_TIME = use-locale;
  };

  packages = with pkgs; [
    git

    # Ai
    claude-code

    # tools/make-packs.sh needs only these two
    jq
    perl

    # hook runner and the tools the hooks that are not wired through git-hooks.nix call directly
    prek
    check-jsonschema
    renovate # for renovate-config-validator

    # everyday shell, and `gh` for the pull requests and workflow runs of this repository
    gh
    curl
    yq-go
    dos2unix
  ];

  # https://devenv.sh/languages/
  languages.nix.enable = true;

  # Node is here for the TypeScript app. pnpm.install.enable is deliberately off until a
  # package.json and a pnpm-lock.yaml exist -- devenv would fail on shell entry without them.
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs;
    corepack.enable = true;
    # Install on shell entry, so that the tools the git hooks call (prettier, eslint, tsc, vitest)
    # are in node_modules/.bin. pnpm.enable puts the nixpkgs pnpm on PATH too; every invocation
    # happens in this directory, where the "packageManager" field decides the version.
    pnpm.enable = true;
    pnpm.install.enable = true;
  };
  languages.typescript.enable = true;

  git-hooks.package = pkgs.prek;

  tasks."devenv:git-hooks:run" = {
    # Print the output of the git hooks that "devenv test" runs, otherwise a failing hook only
    # reports that it failed.
    showOutput = true;
  };

  # https://devenv.sh/git-hooks/
  git-hooks.hooks = {
    # ---- whitespace and file shape
    dos2unix = {
      enable = true;
      entry = "dos2unix";
      args = [ "--info=c" ];
      excludes = generated;
    };

    trim-trailing-whitespace = {
      enable = true;
      excludes = generated;
    };

    end-of-file-fixer = {
      enable = true;
      excludes = generated;
    };

    check-executables-have-shebangs.enable = true;
    check-shebang-scripts-are-executable.enable = true;
    check-symlinks.enable = true;

    # The largest mappack is ~650 KB. The limit is here to catch a stray second copy of one, or a
    # build artefact landing in git by accident.
    check-added-large-files = {
      enable = true;
      args = [ "--maxkb=1024" ];
    };

    editorconfig-checker = {
      enable = true;
      excludes = generated;
    };

    # ---- per language
    nixfmt.enable = true;

    shellcheck = {
      enable = true;
      args = [
        "-x"
        "-o"
        "all"
      ];
    };

    markdownlint = {
      enable = true;
      settings.configuration = {
        # The German prose in README.md is written one paragraph per line, some of them 500
        # characters long. Reflowing it would make the diffs useless.
        MD013 = false;
      };
    };

    yamllint = {
      enable = true;
      excludes = [
        "^pnpm-lock\\.yaml$"
      ];
      settings = {
        strict = true;
        # `on:` in a GitHub Actions workflow is a YAML 1.1 truthy value, so it has to be allowed.
        configData = "{ extends: default, rules: { document-start: disable, line-length: {max: 165}, truthy: {allowed-values: ['true', 'false', 'on']} } }";
      };
    };

    check-json.enable = true;
    check-toml.enable = true;
    actionlint.enable = true;

    renovate-config-validator = {
      enable = true;
      entry = "renovate-config-validator";
      files = "^renovate\\.json$";
    };

    # ---- secrets and spelling
    ripsecrets.enable = true;

    typos = {
      enable = true;
      # Both lists: the generated bundles carry the German interface texts inside them.
      excludes = natural-language ++ generated;
      exclude_types = [ "svg" ];
    };

    # ---- the TypeScript app
    # These call the tools from node_modules/.bin, which languages.javascript.pnpm.install puts
    # there on shell entry. All of them look at the whole project rather than at the files prek
    # hands over: tsc and vitest have to, and prettier and eslint are configured project-wide.
    # Prettier owns the application source and its own two config files, and nothing else. Pointing
    # it at the whole project reformats mappack.schema.json -- which is published, and whose $id
    # other people's packs refer to -- along with manifest.webmanifest and devenv.yaml. Those are
    # hand-maintained and have their own checkers.
    prettier = {
      enable = true;
      entry = "${config.devenv.root}/node_modules/.bin/prettier --write src eslint.config.mjs vite.config.ts";
      files = "(^src/|^eslint\\.config\\.mjs$|^vite\\.config\\.ts$|^\\.prettier)";
      pass_filenames = false;
    };

    eslint = {
      enable = true;
      entry = "${config.devenv.root}/node_modules/.bin/eslint --max-warnings 0 --fix .";
      files = "\\.(tsx?|mjs)$";
      pass_filenames = false;
    };

    tsc = {
      enable = true;
      entry = "${config.devenv.root}/node_modules/.bin/tsc";
      files = "(^src/|^package\\.json$|^tsconfig.*\\.json$|^mappack\\.schema\\.json$)";
      pass_filenames = false;
    };

    tsc-node = {
      enable = true;
      entry = "${config.devenv.root}/node_modules/.bin/tsc --project tsconfig.node.json";
      files = "(^vite\\.config\\.ts$|^tsconfig.*\\.json$|^package\\.json$)";
      pass_filenames = false;
    };

    vitest = {
      enable = true;
      entry = "${config.devenv.root}/node_modules/.bin/vitest run";
      files = "(^src/|^maps/|^mappack\\.schema\\.json$|^package\\.json$|^vite\\.config\\.ts$)";
      pass_filenames = false;
    };

    # The committed app at the repository root has to be the one the sources build. This runs the
    # build and syncs it; if that changes anything, the hook reports "files were modified by this
    # hook" exactly as prettier does, and the fresh output is there to be added to the commit.
    build-current = {
      enable = true;
      entry = "${config.devenv.root}/tools/check-build.sh";
      files = "(^src/|^package\\.json$|^pnpm-lock\\.yaml$|^vite\\.config\\.ts$|^tsconfig.*\\.json$|^maps/pack\\.showcase\\.json$)";
      pass_filenames = false;
    };

    # ---- the mappacks
    # Two independent checks, the same two that CI used to run: the schema says what a mappack may
    # look like, make-packs.sh says whether the packs agree with each other and with their counts.
    validate-mappacks = {
      enable = true;
      entry = "${config.devenv.root}/tools/validate-packs.sh";
      files = "^(maps/.*\\.json|mappack\\.schema\\.json|tools/validate-packs\\.sh)$";
      pass_filenames = false;
    };

    check-mappacks = {
      enable = true;
      entry = "${config.devenv.root}/tools/make-packs.sh";
      args = [ "--check" ];
      files = "^(maps/.*\\.json|mappack\\.schema\\.json|tools/make-packs\\.sh)$";
      pass_filenames = false;
    };
  };

  enterShell = ''
    # is interactive shell?
    if tty -s; then
      devenv-help
    fi
  '';

  scripts.devenv-help = {
    description = "Print this help";
    exec = ''
      set -euo pipefail
      cd '${config.devenv.root}'

      echo
      echo "Helper scripts provided by the devenv:"
      echo
      sed -e 's| |XXXXXX|g' -e 's|=| |' <<EOF | column -t | sed -e 's|^|- |' -e 's|XXXXXX| |g'
      ${lib.generators.toKeyValue { } (lib.mapAttrs (_name: value: value.description) config.scripts)}
      EOF
      echo
    '';
  };

  scripts.lint = {
    description = "Run all git hooks over the whole repository";
    exec = ''
      (
        set -euo pipefail
        cd '${config.devenv.root}'

        prek run "''${@:---all-files}"
      )
    '';
  };

  scripts.dev = {
    description = "Start the development server with live reloading";
    exec = ''
      (
        set -euo pipefail
        cd '${config.devenv.root}'

        ./node_modules/.bin/vite "''${@}"
      )
    '';
  };

  scripts.build = {
    description = "Build the app into the repository root";
    exec = ''
      (
        set -euo pipefail
        cd '${config.devenv.root}'

        ./tools/check-build.sh
      )
    '';
  };

  scripts.test = {
    description = "Run the unit tests";
    exec = ''
      (
        set -euo pipefail
        cd '${config.devenv.root}'

        ./node_modules/.bin/vitest "''${@:-run}"
      )
    '';
  };

  scripts.serve = {
    description = "Serve the built app over http so that the service worker works";
    exec = ''
      (
        set -euo pipefail
        cd '${config.devenv.root}'

        ./tools/serve.pl "''${@}"
      )
    '';
  };

  scripts.make-packs = {
    description = "Check the mappacks, or cut a showcase out of one";
    exec = ''
      (
        set -euo pipefail
        cd '${config.devenv.root}'

        ./tools/make-packs.sh "''${@}"
      )
    '';
  };

  scripts.check-packs = {
    description = "Check the mappacks against the schema and against each other";
    exec = ''
      (
        set -euo pipefail
        cd '${config.devenv.root}'

        ./tools/validate-packs.sh
        ./tools/make-packs.sh --check
      )
    '';
  };
}
