(window.webpackJsonp=window.webpackJsonp||[]).push([[16],{399:function(s,e,a){"use strict";a.r(e);var t=a(10),r=Object(t.a)({},(function(){var s=this,e=s.$createElement,a=s._self._c||e;return a("ContentSlotsDistributor",{attrs:{"slot-key":s.$parent.slotKey}},[a("p",[s._v("Sometimes you want access mysql database remotely, maybe a client requirement or you want to analyize your database. Mysql default settings is configured to listen to local connections, to enable remote access you will have to make some changes to mysql configuration file and create remote user with permission sets you want to allow to that user.")]),s._v(" "),a("h2",{attrs:{id:"configuration"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#configuration"}},[s._v("#")]),s._v(" Configuration")]),s._v(" "),a("div",{staticClass:"language-bash extra-class"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[s._v("$ "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("nano")]),s._v(" /etc/mysql/mysql.conf.d/mysqld.cnf\n")])])]),a("blockquote",[a("p",[s._v("This guide is for mysql 8 version, configuration file path can be different depending on mysql version installed on your server.")])]),s._v(" "),a("p",[s._v("Open and edit this config file and navigate to the line "),a("code",[s._v("bind_address=127.0.0.1")]),s._v(" and modify or add to "),a("code",[s._v("bind_address=0.0.0.0")]),s._v(". Here you're are allowing mysql server to listen to any connection instead of local.")]),s._v(" "),a("div",{staticClass:"language-bash extra-class"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[s._v("$ "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("sudo")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token function"}},[s._v("service")]),s._v(" mysql restart\n")])])]),a("p",[s._v("Restart the mysql service to reflect the new changes you have made to the configuration.")]),s._v(" "),a("h2",{attrs:{id:"setup-a-remote-user"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#setup-a-remote-user"}},[s._v("#")]),s._v(" Setup a remote user.")]),s._v(" "),a("p",[s._v("Now login with your root or any mysql user which has atleast permission to create user.")]),s._v(" "),a("div",{staticClass:"language-bash extra-class"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[s._v("$ mysql -u root -p\n")])])]),a("p",[s._v("Now run the following query to remote user")]),s._v(" "),a("div",{staticClass:"language-sql extra-class"},[a("pre",{pre:!0,attrs:{class:"language-sql"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("CREATE")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("USER")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'remote_user'")]),a("span",{pre:!0,attrs:{class:"token variable"}},[s._v("@'%'")]),s._v(" IDENTIFIED "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("WITH")]),s._v(" mysql_native_password "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("BY")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'secure_password'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])])]),a("blockquote",[a("p",[a("strong",[s._v("NOTE")]),s._v(" 💡\nThis query will create user that authenticates with mysql "),a("code",[s._v("mysql_native_password")]),s._v(" plugin because mysql by default create user with "),a("code",[s._v("caching_sha2_password")]),s._v(" because there are some clients that can cause issue with defaut authenticates plugin. "),a("code",[s._v("%")]),s._v(" means you're creating a user which can be accessed with any host if you really want to restrict it to some spcific host you can put ip here instead.")])]),s._v(" "),a("div",{staticClass:"language-sql extra-class"},[a("pre",{pre:!0,attrs:{class:"language-sql"}},[a("code",[s._v("$ "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("GRANT")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("SELECT")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("ON")]),s._v(" example_database "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("TO")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'remote_user'")]),a("span",{pre:!0,attrs:{class:"token variable"}},[s._v("@'%'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])])]),a("p",[s._v("This command will grant user only read access, be careful with the permissions you assign to your remote user because this can be harmfull. If you really want to allow full access you can do that by running following command.")]),s._v(" "),a("div",{staticClass:"language-sql extra-class"},[a("pre",{pre:!0,attrs:{class:"language-sql"}},[a("code",[a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("GRANT")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("ALL")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("PRIVILEGES")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("ON")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("*")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("*")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("TO")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'remote_user'")]),a("span",{pre:!0,attrs:{class:"token variable"}},[s._v("@'%'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])])]),a("p",[s._v("In case you already gave all the access and want to revoke and limit these permissions to read only run following commands.")]),s._v(" "),a("div",{staticClass:"language-sql extra-class"},[a("pre",{pre:!0,attrs:{class:"language-sql"}},[a("code",[a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# Shows the current grants for a user.")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("SHOW")]),s._v(" GRANTS "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("FOR")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'remote_user'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# If a user already has privileges and you want to revoke all of them.")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("REVOKE")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("ALL")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("ON")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("*")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(".")]),a("span",{pre:!0,attrs:{class:"token operator"}},[s._v("*")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("FROM")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'remote_user'")]),a("span",{pre:!0,attrs:{class:"token variable"}},[s._v("@'%'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n\n"),a("span",{pre:!0,attrs:{class:"token comment"}},[s._v("# Allow read only permission.")]),s._v("\n"),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("GRANT")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("SELECT")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("ON")]),s._v(" example_database "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("TO")]),s._v(" "),a("span",{pre:!0,attrs:{class:"token string"}},[s._v("'remote_user'")]),a("span",{pre:!0,attrs:{class:"token variable"}},[s._v("@'%'")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])])]),a("p",[s._v("Make sure to run "),a("code",[s._v("FLUSH PRIVILEGES")]),s._v(" command. This will free up any memory that the server cached as a result of the preceding CREATE USER and GRANT statements:")]),s._v(" "),a("div",{staticClass:"language-sql extra-class"},[a("pre",{pre:!0,attrs:{class:"language-sql"}},[a("code",[s._v("FLUSH "),a("span",{pre:!0,attrs:{class:"token keyword"}},[s._v("PRIVILEGES")]),a("span",{pre:!0,attrs:{class:"token punctuation"}},[s._v(";")]),s._v("\n")])])]),a("h2",{attrs:{id:"connect-to-remote-database"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#connect-to-remote-database"}},[s._v("#")]),s._v(" Connect to remote database")]),s._v(" "),a("p",[s._v("If you follow above steps correctly you will be able to access your mysql database remotely.")]),s._v(" "),a("div",{staticClass:"language-bash extra-class"},[a("pre",{pre:!0,attrs:{class:"language-bash"}},[a("code",[s._v("$ mysql -u remote_user -h your_mysql_host_server_ip -p\n")])])]),a("p",[s._v("Run this command inside terminal from any host then you'll be asked to enter password, enter your password and with any luck you will be able to successfully connect to your remote mysql database.")]),s._v(" "),a("hr"),s._v(" "),a("p",[s._v("Thanks for reading, if would like to hear more from me, feel free to reach out to me via email or you can follow me on "),a("a",{attrs:{href:"https://twitter.com/Ahmedwaleed11",target:"_blank",rel:"noopener noreferrer"}},[s._v("Twitter"),a("OutboundLink")],1),s._v(".")])])}),[],!1,null,null,null);e.default=r.exports}}]);