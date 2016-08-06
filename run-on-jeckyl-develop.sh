echo "Я думаю что docker у вас установлен нативно"
echo "И даже если у вас Windows - интерпретатор bash у вас доступен в PATH"

docker run --rm --label=jekyll --name=jeckyl-develop --volume=$(pwd):/srv/jekyll \
    -it -p 127.0.0.1:4000:4000 jekyll/jekyll || docker stop jeckyl-develop
