if [[ `git status --porcelain` ]]; then
    echo $1
    exit 1
fi
