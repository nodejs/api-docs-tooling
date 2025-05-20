# # Node.js `api-docs-tooling` Contributing Guide

Thank you for your interest in contributing to the Node.js `api-docs-tooling` project! We welcome contributions from everyone, and we appreciate your help in making this project better.

## Getting started

The steps below will give you a general idea of how to prepare your local environment for the Node.js Website and general steps
for getting things done and landing your contribution.

1. Click the fork button in the top right to clone the [Node.js `api-docs-tooling` Repository](https://github.com/nodejs/api-docs-tooling/fork)

2. Clone your fork using SSH, GitHub CLI, or HTTPS.

   ```bash
   git clone git@github.com:<YOUR_GITHUB_USERNAME>/api-docs-tooling.git # SSH
   git clone https://github.com/<YOUR_GITHUB_USERNAME>/api-docs-tooling.git # HTTPS
   gh repo clone <YOUR_GITHUB_USERNAME>/api-docs-tooling # GitHub CLI
   ```

3. Change into the `api-docs-tooling` directory.

   ```bash
   cd api-docs-tooling
   ```

4. Create a remote to keep your fork and local clone up-to-date.

   ```bash
   git remote add upstream git@github.com:nodejs/api-docs-tooling # SSH
   git remote add upstream https://github.com/nodejs/api-docs-tooling # HTTPS
   gh repo sync nodejs/api-docs-tooling # GitHub CLI
   ```

5. Create a new branch for your work.

   ```bash
   git checkout -b <name-of-your-branch>
   ```

6. Run the following to install the dependencies.

   ```bash
   npm install
   ```

7. Perform your changes.

8. Perform a merge to sync your current branch with the upstream branch.

   ```bash
   git fetch upstream
   git merge upstream/main
   ```

9. Run `node --run format` and `node --run lint` to confirm that linting and formatting are passing.

   ```bash
    node --run format
    node --run lint
   ```

10. Once you're happy with your changes, add and commit them to your branch, then push the branch to your fork.

    ```bash
    cd ~/api-docs-tooling
    git add .
    git commit -m "describe your changes"
    git push -u origin name-of-your-branch
    ```

> [!IMPORTANT]\
> Before committing and opening a Pull Request, please go first through our [Commit](#commit-guidelines);

11. Create a Pull Request.

## Commit Guidelines

This project follows the [Conventional Commits][] specification.

### Commit Message Guidelines

- Commit messages must include a "type" as described on Conventional Commits
- Commit messages **must** start with a capital letter
- Commit messages **must not** end with a period `.`

### Pre-commit Hooks

This project uses [Husky][] for Git pre-commit hooks.
It's lint and format stages your code before committing.
You can disable the pre-commit hooks by using the `--no-verify` flag.

```bash
git commit -m "describe your changes" --no-verify
```

## Developer's Certificate of Origin 1.1

```
By contributing to this project, I certify that:

- (a) The contribution was created in whole or in part by me and I have the right to
  submit it under the open source license indicated in the file; or
- (b) The contribution is based upon previous work that, to the best of my knowledge,
  is covered under an appropriate open source license and I have the right under that
  license to submit that work with modifications, whether created in whole or in part
  by me, under the same open source license (unless I am permitted to submit under a
  different license), as indicated in the file; or
- (c) The contribution was provided directly to me by some other person who certified
  (a), (b) or (c) and I have not modified it.
- (d) I understand and agree that this project and the contribution are public and that
  a record of the contribution (including all personal information I submit with it,
  including my sign-off) is maintained indefinitely and may be redistributed consistent
  with this project or the open source license(s) involved.
```

[Conventional Commits]: https://www.conventionalcommits.org/
[Commit Signing]: https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits
[Husky]: https://typicode.github.io/husky/
