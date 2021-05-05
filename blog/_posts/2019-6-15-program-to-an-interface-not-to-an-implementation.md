---
title: Program To An Interface, Not An Implementation.
date: 2019-6-15
tags: 
  - php
  - laravel
  - oop
  - design-pattern
  - interface
author: Ahmed Waleed
location: Multan, Pakistan  
---

All of us as programmers have probably heard the phrase called "Program to an interface, not an implementation." The first time I heard this phrase it was very confusing to me and it took me a while to understand and apply this principle in my daily development process. Most people or online resources that I consulted didn't explain this concept in a very easy or understandable way. But because I've spent so much time in properly understanding this concept, I'm hoping I can make it a bit easier for you to understand. So let's start by recalling one of the most important OOP concepts, "abstraction".

>Abstraction is selecting data from a larger pool to show only the relevant details to the object. It helps to reduce programming complexity and effort. In PHP, abstraction is accomplished using Abstract classes and interfaces.

Confusing, right? It didn't ring a bell on my head when I read it the first time.

Just forget about abstraction right now and let's try to understand "encapsulation" first.

Encapsulation hides properties and methods in a class so that the outside world (client code) doesn't know about those properties and the only way to have access to these properties is with the help of setter and getter functions. Now that you know what encapsulation is, it's time to go one step further and understand abstraction.

>Abstraction is also an encapsulation but it hides data at a higher degree (class level)".

Still confusing? Don't worry at all. I am going to explain it with real-world examples by describing real problems we face in our daily work.

Let's assume you are working on a project when the project manager comes to you and says we need a user profiles listing feature where we can see a list of all users' profiles and maybe some other stuff as well related to it.

```php
class DbUserService
{
  public function getProfiles()
  {
    return DB::table('users')->get();
  }
}

class ProfileController
{
  public function get(DbUserService $service) // changed
  {
    return $service->getProfiles();
  }
}

$profils = (new ProfileController)->get(new DbUserService());
```
and you end up with something like this where you have decided to store user’s profile in the MySQL database and your DbUserService is responsible for retrieving the user profiles. It’s looking good so far but what if the project manager comes to you and says that from now on we will be using filesystem for users’ data and you are not in the position to question his decision?
```php
class FileUserService
{
  public function getProfiles()
  {
    return explode("\n", file_get_contents($filename))
  }
}

class ProfileController
{
  public function get(FileUserService $service) // changed
  {
    return $service->getProfiles();
  }
}

$profils = (new ProfileController)->get(new FileUserService());
```

Most probably we will end up having another service. That is okay but there is one issue with this approach: what if that person keeps coming to you with the new requirements? Every time you will have to change the existing code (violating the open/close principle of SOLID) to meet your new requirements like we made changes in ProfileController and replaced DbUserService with file FileUserService.

Now consider this solution…

```php
interface UserProfileServiceInterface
{
  public function getProfiles();
}

class DbUserService implements UserProfileServiceInterface
{
  public function getProfiles()
  {
    return DB::table('users')->get();
  }
}

class FileUserService implements UserProfileServiceInterface
{
  public function getProfiles()
  {
    return explode("\n", file_get_contents($filename))
  }
}

class ProfileController
{
  public function get(UserProfileServiceInterface $service) // will not change, (encapsulation at higher degree (class level))
  {
    return $service->getProfiles();
  }
}

$profiles = (new ProfileController)->get(new DbUserService())
$profiles = (new ProfileController)->get(new FileUserService())
```

I have created a UserProfileServiceInterface and each service is implementing that interface. Also, all these services are sharing a contract that no matter what service ProfileController::get method will receive, it must have the implementation of the getProfiles method. This example clearly demonstrates the concept of abstraction. We encapsulated our services behind UserProfileServiceInterface and that’s what I meant when I said: 

>“abstraction is also an encapsulation but at a higher degree (class level)”. This also demonstrates the idea of “Program to an interface, not an implementation.”

---
Finally, if you have any thoughts you want to share on the topic, I’d love to hear from you! You can reach me via [Twitter](https://twitter.com/Ahmedwaleed11).

Thank you for reading!