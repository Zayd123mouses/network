FROM python:3
COPY . /user/src/app
WORKDIR /user/src/app
RUN pip3 install -r requirements.txt
CMD ["python3", "manage.py", "runserver" ,"127.0.0.1:8000"]