# Git Submodules targets {{{
git_new_branch_recursively:
	git submodule foreach --recursive "git checkout -b $(shell git rev-parse --abbrev-ref HEAD)"
	git submodule foreach --recursive "git push -u origin $(shell git rev-parse --abbrev-ref HEAD)"

git_checkout_branch_recursively:
	git submodule foreach --recursive "git checkout $(shell git rev-parse --abbrev-ref HEAD)"
	git submodule foreach --recursive "git pull"

git_checkout_develop_recursively:
	git submodule foreach --recursive "git checkout develop"
	git submodule foreach --recursive "git pull"

git_merge_develop_in_recursively: git_checkout_branch_recursively
	git pull
	git pull origin develop
	git submodule foreach --recursive "git pull"
	git submodule foreach --recursive "git pull origin develop"

git_push_recursively:
	git submodule foreach --recursive "git push"
	git push

git_status_recursively:
	git submodule foreach --recursive "git status"
	git submodule status --recursive

git_go_all_develop:
	git checkout develop
	git pull
	git submodule foreach --recursive "git checkout develop"
	git submodule foreach --recursive "git pull"
# }}}
# vim:foldmethod=marker:foldlevel=0
