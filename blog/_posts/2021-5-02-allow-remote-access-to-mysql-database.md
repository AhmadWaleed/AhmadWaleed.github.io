---
title: Allow remote access to MySql database.
date: 2021-5-02
tags: 
  - mysql
  - sql
author: Ahmed Waleed
location: Multan, Pakistan  
---

Sometimes you want access mysql database remotely, maybe a client requirement or you want to analyize your database. Mysql default settings is configured to listen to local connections, to enable remote access you will have to make some changes to mysql configuration file and create remote user with permission sets you want to allow to that user.

## Configuration
```bash
$ sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```
> This guide is for mysql 8 version, configuration file path can be different depending on mysql version installed on your server.

Open and edit this config file and navigate to the line `bind_address=127.0.0.1` and modify or add to `bind_address=0.0.0.0`. Here you're are allowing mysql server to listen to any connection instead of local.
```bash
$ sudo sertice mysql restart
```

Restart the mysql service to reflect the new changes you have made to the configuration.


## Setup a remote user.

Now login with your root or any mysql user which has atleast permission to create user.

```bash
$ mysql -u root -p
```

Now run the following query to remote user 

```sql
CREATE USER 'remote_user'@'%' IDENTIFIED WITH mysql_native_password BY 'secure_password';
```

>**NOTE** 💡
This query will create user that authenticates with mysql `mysql_native_password` plugin because mysql by default create user with `caching_sha2_password` because there are some clients that can cause issue with defaut authenticates plugin. `%` means you're creating a user which can be accessed with any host if you really want to restrict it to some spcific host you can put ip here instead.


```sql
$ GRANT SELECT ON example_database TO 'remote_user'@'%';
```

This command will grant user only read access, be careful with the permissions you assign to your remote user because this can be harmfull. If you really want to allow full access you can do that by running following command.

```sql
GRANT ALL PRIVILEGES ON *.* TO 'remote_user'@'%';
```

In case you already gave all the access and want to revoke and limit these permission to read only run following commands.

```sql
# Shows the current grants for a user.
SHOW GRANTS FOR 'remote_user';

# If a user already has privileges and you want to revoke all of them.
REVOKE ALL ON *.* FROM 'remote_user'@'%';

# Allow read only permission.
GRANT SELECT ON example_database TO 'remote_user'@'%';
```

Make sure to run `FLUSH PRIVILEGES` command. This will free up any memory that the server cached as a result of the preceding CREATE USER and GRANT statements:

```sql
FLUSH PRIVILEGES;
```

## Connect to remote database

If you follow above steps correctly you will be able to access your mysql database remotely.

```bash
$ mysql -u remote_user -h your_mysql_host_server_ip -p
```

Run this command inside terminal from any host then you'll be asked to enter password, enter your password and with any luck you will be able to successfully connect to your remote mysql database.


---
Thanks for reading, if would like to hear more from me, feel free to reach out to me via email or you can follow me on [Twitter](https://twitter.com/Ahmedwaleed11).
