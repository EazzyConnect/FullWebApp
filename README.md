# portfolio

### description of what you are expected to build.

The goal of this project is to have a web application where users, would display their skills, stack and a description about them (A portfolio).
Each user should be able to signup, and dynamically create and update their portfolio.

## Routes

These are the endpoints your API should produce

#### No Auth Routes

* `GET /users` get all approved users  ` projection  name,username,intro`
*  `GET /users/:username`  get the user with this username ` projection: everything except the password`
*  `GET
*  `POST /auth/signup` => create a user  `submitting {username[unique], password[length must be > 4], name, email[unique] } : all required`
*  `POST /auth/login` => Log a user in  `{username , password} : all required`

#### Auth Route

* `GET /users/profile` returns the logged in users without the password
* `PUT /users/profile` Edit the logged in user profile [except the password & role & createdOn]
* `PUT /users/settings ` Change the user password and invalidate every other logged in users token

@Admin role [Auth route but available to only Admins ]
* PUT `/update/username` can only update their role or approved property
* `/users/unapproved` List of users awaiting approval

### Your Schema should look something like this

```
   schema {
        name[required],
        email[required, unique],
        username[required, unique],
        password [minLength of 6 & also required],
        createdOn [Date],
        intro [maxLength of 100 characters],
        about [maxLength of 1000 characters],
        tools : list of your tech skills
        howManyMonthsProgramming : Number of months,
        favoriteMealInTechquestProgram : 
        favoriteQuote: String
        role : [possible values "admin", "user"] : default of user
        lastChangedPassword : Date
        approved : Boolean,
    }
```

## Contributing

Note: Only users added as contributors to this project are allowed!

Each contributors should have two branches, one for creating the app using a json database and another using mongodb
To contribute :

1. Clone this repo.
   ``` $ git clone https://github.com/Techquet-Academy-class-project/portfolio.git  ```
3. From the master branch, create your own branch, your branch format should be `Yourname/mongodb ` or `Yourname/jsondb`
   
   ```$ git checkout master ```
   
   ``` $ git checkout -b yourname/jsondb```
   
5. write your codes, commit each feature you implement and push to your own branch

   ``` $ git push origin yourname/jsondb```


