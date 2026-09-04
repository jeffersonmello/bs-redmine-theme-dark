#!/usr/bin/env ruby
# frozen_string_literal: true

require "pathname"

ROOT = Pathname.new(__dir__).join("..").expand_path
TARGET_REDMINE = "5.1.4"
REQUIRED_FILES = %w[
  stylesheets/application.css
  stylesheets/style.css
  stylesheets/plugins.css
  stylesheets/custom.css
  javascripts/theme.js
  webfonts/fa-solid-900.eot
  webfonts/fa-solid-900.svg
  webfonts/fa-solid-900.ttf
  webfonts/fa-solid-900.woff
  webfonts/fa-solid-900.woff2
  README.md
  LICENSE
  THIRD_PARTY_NOTICES.md
].freeze
EXPECTED_IMPORTS = %w[
  ../../../stylesheets/application.css
  style.css
  plugins.css
  custom.css
].freeze
ALLOWED_CORE_REFERENCES = %w[
  ../../../stylesheets/application.css
  ../../../images/arrow_down.png
  ../../../images/arrow_up.png
  ../../../images/magnifier.png
].freeze

errors = []
warnings = []

REQUIRED_FILES.each do |relative|
  errors << "missing required file: #{relative}" unless ROOT.join(relative).file?
end

application_css = ROOT.join("stylesheets/application.css")
if application_css.file?
  imports = application_css.read.scan(/@import\s+url\(\s*([^)]+?)\s*\)\s*;/i).flatten.map do |value|
    value.strip.sub(/\A["']/, "").sub(/["']\z/, "")
  end
  errors << "unexpected application.css import order: #{imports.inspect}" unless imports == EXPECTED_IMPORTS
end

css_files = Dir[ROOT.join("stylesheets/**/*.css").to_s].sort.map { |path| Pathname.new(path) }
remote_urls = []
core_references = []

css_files.each do |css_file|
  source = css_file.read
  relative_css = css_file.relative_path_from(ROOT)

  without_comments = source.gsub(%r{/\*.*?\*/}m, "")
  without_strings = without_comments.gsub(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/m, "")
  opens = without_strings.count("{")
  closes = without_strings.count("}")
  errors << "unbalanced CSS blocks in #{relative_css}: #{opens} opening, #{closes} closing" unless opens == closes

  source.scan(/url\(\s*(?:"([^"]+)"|'([^']+)'|([^)'"\s]+))\s*\)/i).each do |match|
    raw = match.compact.first
    next if raw.nil? || raw.empty? || raw.start_with?("data:", "#")

    if raw.match?(%r{\Ahttps?://}i)
      remote_urls << raw
      next
    end

    clean = raw.split(/[?#]/, 2).first
    if clean.start_with?("../../../")
      core_references << clean
      errors << "unapproved Redmine core reference in #{relative_css}: #{clean}" unless ALLOWED_CORE_REFERENCES.include?(clean)
      next
    end

    resolved = css_file.dirname.join(clean).cleanpath
    errors << "missing theme asset referenced by #{relative_css}: #{clean}" unless resolved.file?
  end
end

font_svg = ROOT.join("webfonts/fa-solid-900.svg")
if font_svg.file?
  svg = font_svg.read
  icon_codepoints = css_files.flat_map do |css_file|
    css_file.read.scan(/content\s*:\s*["']\\([ef][0-9a-f]{3,5})["']/i).flatten.map(&:downcase)
  end.uniq.sort
  missing_glyphs = icon_codepoints.reject { |codepoint| svg.include?("unicode=\"&#x#{codepoint};\"") }
  errors << "Font Awesome SVG is missing CSS glyphs: #{missing_glyphs.join(', ')}" unless missing_glyphs.empty?
end

readme = ROOT.join("README.md")
if readme.file?
  contents = readme.read
  errors << "README must name Redmine 5.1.4.stable" unless contents.include?("Redmine 5.1.4.stable")
  errors << "README still references obsolete Redmine 3.4.10" if contents.include?("3.4.10")
  errors << "README still tells users to select the light theme" if contents.include?("bs-redmine-theme-light")
end

redmine_root = ARGV.first && Pathname.new(ARGV.first).expand_path
if redmine_root
  version_file = redmine_root.join("lib/redmine/version.rb")
  if version_file.file?
    version_source = version_file.read
    version = %w[MAJOR MINOR TINY].map do |part|
      version_source[/\b#{part}\s*=\s*(\d+)/, 1]
    end.join(".")
    errors << "expected Redmine #{TARGET_REDMINE}, found #{version.empty? ? 'unknown' : version}" unless version == TARGET_REDMINE
  else
    errors << "not a Redmine root (missing lib/redmine/version.rb): #{redmine_root}"
  end

  core_references.uniq.each do |reference|
    relative = reference.sub(%r{\A\.\./\.\./\.\./}, "")
    core_file = redmine_root.join("public", relative)
    errors << "Redmine #{TARGET_REDMINE} core asset is missing: public/#{relative}" unless core_file.file?
  end
end

warnings << "runtime uses remote CSS: #{remote_urls.uniq.join(', ')}" unless remote_urls.empty?
warnings.each { |warning| warn "WARN: #{warning}" }

if errors.empty?
  puts "OK: validated theme structure for Redmine #{TARGET_REDMINE} (#{css_files.length} stylesheets, #{core_references.uniq.length} core references)."
  exit 0
end

errors.each { |error| warn "ERROR: #{error}" }
warn "Validation failed with #{errors.length} error(s)."
exit 1
