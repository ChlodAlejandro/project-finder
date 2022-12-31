# Project Finder
So, you operate a server or a Raspberry Pi with a few pet projects on it. You have a bunch of projects, scattered around and doing their own thing, but then you suddenly have to migrate all of those projects. You're can't back up the server data, or need to reinstall the system while preserving files. You never had the foresight of using Docker or Ansible to ensure that every single installation of your project is reproducible in a system completely isolated from your existing server. What now?

The Project Finder aims to look for every pet project in a given folder. It crawls through every directory on your drive, skips whatever it knows is not a project, and then tries to find a project in the remaining directories. It then returns a list of projects, with their (detected) name, path, and how they were determined.

## Detection

Detection happens through detectors. This usually looks for files specific to a given language or package management system, such as npm, Yarn, Composer, etc.
