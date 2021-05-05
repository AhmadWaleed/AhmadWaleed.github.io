---
title: Laravel MySQL select latest record from relational table.
date: 2020-12-31
tags: 
  - laravel
  - php
  - mysql
  - query-builder
author: Ahmed Waleed
location: Multan, Pakistan  
---

In this blog post we’re going to look how we can query latest record from relational table in MySql. I was working on client project and i needed to export persons latest attachment to some cloud CRM solution from our old legacy php mysql web application.

Lets say we have two tables persons and attachments, i want to query first latest attachment for each person in mysql has many relationship, so i ended up with this query.

```sql
SELECT `p`.*, 
       `a`.* 
FROM   `persons` AS `p` 
       INNER JOIN `attachments` AS `a` 
               ON `a`.`person_id` = `p`.`id` 
       INNER JOIN (SELECT `person_id`, Max(created) AS latest_date 
                   FROM   `attachments` 
                   GROUP  BY `person_id`
       ) AS `latest_attachment` 
       ON `a`.`person_id` = `latest_attachment`.`person_id` 
       AND `a`.`created` =   `latest_attachment`.`latest_date`
```

If you take a closer look at query its simple to follow the only trick here is subquery in second inner join clause so basically what i am doing here is creating a [virtual table](https://stackoverflow.com/questions/12794127/mysql-select-data-and-create-a-virtual-table/12794206) (latest_attachment) which represents only latest attachment for each person and then applying join based on person id and latest attachment created date.

We have our raw query in place lets convert this to laravel [query builder](https://laravel.com/docs/8.x/queries). Laravel allows us to pass subquery (virtual table) as first argument to [join](https://laravel.com/docs/8.x/queries#joins) method but in the later versions after 5.6 laravel query builder has dedicated method [joinSub](https://laravel.com/docs/8.x/queries#subquery-joins) which accepts first argument as closure with passing new query builder instance so that instead of passing raw subquery we can actually pass an query builder instance wraped with closure function and if we have more then one join condition we can pass those in second argument as closure, behind the scene laravel will call execute that closure and pass join instance in it so we can use it in our closure.

```php
DB::table('persons', 'p')
    ->select('p.*', 'a.*')
    ->join('attachments as a', 'a.person_id', 'p.id')
    ->joinSub(function (Builder $query) {
        $query->select(
                'person_id', 
                 DB::raw('MAX(created) as latest_date')
            )
            ->from('avr_attachments')
            ->groupBy('person_id');
    }, 'latest_attachment', function (JoinClause $join) {
        $join->on('a.person_id', '=', 'latest_attachment.person_id')
            ->on('a.created', '=', 'latest_attachment.latest_date');
})->get();
```

This is how query looks like in laravel and we have successfully converted a raw mysql query to laravel query builder instance.

---
Hopefully you have learned something in this post if you like it then please follow me on [Twitter](https://twitter.com/Ahmedwaleed11). for more posts Thanks.