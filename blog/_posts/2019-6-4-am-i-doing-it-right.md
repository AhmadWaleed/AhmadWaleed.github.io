---
title: Am I doing it right?
date: 2019-6-04
tags: 
  - laravel
  - php
  - design-pattern
  - refactoring
author: Ahmed Waleed
location: Multan, Pakistan  
---

Every time I write a single line of code I always ask this question to myself: “Am I doing it right?” or “Is this the right place to put my code”. I think only by asking these kinds of questions to myself I can add much more quality to my code. Now you might be wondering that how asking a question as simple as this can improve your codebase. Let me answer this by giving you an example.
```php
// PostsController.php
public function store(Request $request)
{
    // validating form request
    $rules = [
        'title' => 'required',
        'body' => 'required'
    ];

    $validator = Validator::make($request->all(), $rules);

    if ($validator->fails()) {
        return redirect('post/create')
            ->withErrors($validator);
    }

    // transforming form data
    $attributes = [
        'title' => trim($request->title),
        'body' => trim($request->body),
    ];

    // creating post
    $post = Post::create($attributes);

    // publish post
    $post->published_at = now();
    $post->save();

    return redirect('/posts');
}
```
Consider this Laravel controller store function example. This function is doing a couple of things which you can easily understand by reading the comments present in different parts of the function. Now tell me this: Does this code looks perfect to you? If your answer is “No way man! You are doing too much in a single function” or “where is the ‘S’ (Single Responsibility Principle) of solid principles”, then I think you wouldn’t have much difficulty understanding what I am about to explain next.
But if you don’t know all that stuff, no need to worry! I will explain it to you like we explain something to a 5-year-old child. So stay focused and keep reading!

Let’s consider this block of code and ask the question “Am I doing it right?”

```php
// validating form request
  $rules = [
      'title' => 'required',
      'body' => 'required'
  ];

  $validator = Validator::make($request->all(), $rules);

  if ($validator->fails()) {
      return redirect('post/create')
          ->withErrors($validator);
  }
```
Does this code belong here? The answer is No. It is violating the Single Responsibly Principle and it shouldn't be here. Its logic must be separated out in a dedicated class which is only responsible for validating incoming request data. Before refactoring that logic into some other place, just think for a minute about the framework you’re using. Does that provide any feature for validating request data out of the box? In our case, yes, Laravel does provide Form Requests. So let's refactor it now.
```php
class PostRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    
    public function rules()
    {
        return [
            'title' => 'required',
            'body' => 'required'
        ];
    }
}


```
Now our validation logic is extracted to a dedicated class. It’s time to move to the next block of code and ask the same question again: “Am I doing it right”?

```php
// transforming form data
$attributes = [
    'title' => trim($request->title),
    'body' => trim($request->body),
];
```

You might be thinking that leaving these few lines of code won’t cause the world to end. You’re right, it won’t. But what if your form data has hundreds of properties. Can you imagine how messy this could become? You’ll be having hundreds of lines of code just for transforming request data.
Let’s now extract it out, but where should I? Instead of making a separate class for transforming data, let’s just think for a few minutes because I don’t want to pollute my code by creating classes for every line of code.

>Tip: 💡 Always ask yourself this: “Can the framework or existing service which you are using handle this logic?” If it can, there’s no need for you to make a new one.

```php
class PostRequest extends FormRequest
{
    //
    
    public function prepareForValidation()
    {
        $this->title = trim($this->title);
        $this->body = trim($this->body);
    }
    
    //
}

```
I overrode the parent class method which is like a hook and gets called before you have access to your form data. I think that's the right place to transform your data. Imagine what else you can do with that method. Let’s parse the next block of code.

Again ask the same question. For me to have `Post::create()` in the controller is totally fine but what about publishing a post?
```php
Post extends Model
{
  public function publish()
  {
    $this->published_at = now();
    $this->save();
  }
}
```

I extracted the publish post logic inside the model publish method because publishing a post logic can be more complicated than two lines. As a rule of thumb, always remember to keep your controllers thin and models fat.

Here is the final store function.

```php
// PostsController.php
public function store(PostRequest $request)
{
    $post = Post::create($request->validated());
    
    $post->publish();

    return redirect('/posts');
}
```

I think it’s a good refactor and you can now see how we simplified our logic and added quality to our code. If you keep asking this question and think before writing any line of code, you won’t have to master design principles just for writing simple and quality code which you and others can understand easily.

---

Thanks for reading, if would like to hear more from me, feel free to reach out to me via email or you can follow me on [Twitter](https://twitter.com/Ahmedwaleed11).
