# Repository Guard

## Purpose

Repository Guard protects Ask Genie Bhai from accidental cross-project work. It verifies that repository automation is running only inside the official Ask Genie Bhai repository.

## Mandatory Isolation

Ask Genie Bhai is an independent product. Repository boundaries must stay explicit and enforced so that code, workflows, configuration, branches, commits, and pull requests cannot accidentally cross into another project.

## Engineering Policy

Ask Genie Bhai is a completely independent product. No file, configuration, workflow, commit, pull request, branch, or implementation may cross repository boundaries without explicit approval.

## Workflow Validation

The Repository Guard GitHub Action runs on every push, every pull request, and manual workflow dispatch. It validates that the current GitHub repository is exactly:

```text
oxiomindia/askgeniebhai
```

## Failure Behavior

If the workflow runs in any other repository, it fails immediately with a clear error message explaining that the workflow is exclusive to the Ask Genie Bhai repository. If the repository is correct, it prints a success message confirming that Repository Guard has passed.
