const express = require("express");
const { cleanupAndValidate } = require("./utils/AuthUtils");
const { isAuth } = require("./middlewares/isAuth")
const UserModel = require("./Models/userModel");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const session = require("express-session");
const InventoryModel = require("./Models/InventoryModel");
const mongoDbSession = require("connect-mongodb-session")(session);
const app = express();

// variable
const PORT = process.env.PORT || 8000;
const MONGO_URI = `mongodb+srv://abhishek28:12345@cluster0.u1p3jhx.mongodb.net/module-test?retryWrites=true&w=majority`;
const store = new mongoDbSession({
    uri: MONGO_URI,
    collection: "sessions",
  });
  
//middlwares
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
      secret: "This is our april nodejs class",
      resave: false,
      saveUninitialized: false,
      store: store,
    })
  );
  app.use(express.static("public"));
  
//Db connection
mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log("MongoDb Connected");
    })
    .catch((error) => {
        console.log("mongo error", error);
    });

//Routes
app.get("/",isAuth, (req, res) => {
    return res.render("dashboard");
})
app.get("/register", (req, resp) => {
    return resp.render("register");
})
app.get("/login", (req, resp) => {
    return resp.render("login");
})
//Post
app.post("/register", async (req, res) => {
    const { name, email, username, password } = req.body;
    try {
        await cleanupAndValidate({ email, name, password, username });
    } catch (error) {
        return res.send({
            status: 400,
            message: "Data Error",
            error: error,
        });
    }

    try {
        // Check if email exists
        const userObjEmailExists = await UserModel.findOne({ email });
        if (userObjEmailExists) {
            return res.send({
                status: 400,
                message: "Email Already Exists",
            });
        }

        // Check if username exists
        const userObjUsernameExists = await UserModel.findOne({ username });
        if (userObjUsernameExists) {
            return res.send({
                status: 400,
                message: "Username Already Exists",
            });
        }

        //password hashing
        const hashedPassword = await bcrypt.hash(password, 10);
        // Insert to database
        const user = new UserModel({
            name: name,
            email: email,
            username: username,
            password: hashedPassword
        });

        const userDb = await user.save();
        console.log(userDb);
        res.send({
            status: 201,
            message: "User registered successfully",
            data: userDb
        });
    } catch (error) {
        res.send({
            status: 500,
            message: "Database Error",
            error: error
        });
    }
    return res.redirect("/login");
});

app.post("/login", async (req, res) => {
    //console.log(req.body);
    const { loginId, password } = req.body;
    //Data validation
  
    if (!loginId || !password) {
      return res.send({
        status: 400,
        message: "Missing credentials",
      });
    }
  
    if (typeof loginId !== "string" || typeof password !== "string") {
      return res.send({
        status: 400,
        message: "Invalid Data Format",
      });
    }
  
    //find the user obj from loginId
    let userDb;
    if (validator.isEmail(loginId)) {
      userDb = await UserModel.findOne({ email: loginId });
    } else {
      userDb = await UserModel.findOne({ username: loginId });
    }
    // console.log(userDb);
    if (!userDb) {
      return res.send({
        status: 400,
        message: "User does not exist, Please register first",
      });
    }
  
    //compare the password
  
    const isMatch = await bcrypt.compare(password, userDb.password);
   
    if (!isMatch) {
      return res.send({
        status: 400,
        message: "Password incorrect",
      });
    }
   
    //successfull login

    req.session.isAuth = true;
    req.session.user = {
      username: userDb.name,
      email: userDb.email,
      userId: userDb._id,
    };
    
    return res.redirect("/dashboard");
  });
  app.get("/dashboard",isAuth,async(req,res)=>{
    const username = req.session.user.username;
    try {
      const books = await InventoryModel.find({ username: username });
      return res.render("dashboard",{data: books})
    } catch (error) {
      return res.send(error);
    }
  
  })

  app.post("/logout", isAuth, (req, res) => {
    req.session.destroy((error) => {
      if (error) throw error;
      return res.redirect("/login");
    });
  });

app.post("/add-book",isAuth,async(req,res)=>{
    const {title,author,price,category}=req.body;
        //Data validation
  
        if (!title || !author || !price ||!category) {
            return res.send({
              status: 400,
              message: "Missing Book Details",
            });
          }
        
          if (typeof title !== "string" || typeof author !== "string" || typeof category !== "string") {
            return res.send({
              status: 400,
              message: "Invalid Data Format",
            });
          }
        const addBook = new InventoryModel({
            title:title,
            author:author,
            price:price,
            category:category,
            username:req.session.user.username
        });
          //save in db
  try {
    const addedBook = await addBook.save();
    console.log(addedBook);

    return res.send({
      status: 201,
      message: "Book Added successfully",
      data: addedBook,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }

});
  app.get("/read-books", isAuth, async (req, res) => {
  //username
  const username = req.session.user.username;
  try {
    const books = await InventoryModel.find({ username: username });
    console.log(books);

    return res.send({ status: 200, message: "Read success", data: books });
  } catch (error) {
    return res.send(error);
  }
}); 
app.post("/edit-book",isAuth,async(req,res)=>{
    const {id,title,author,price,category}=req.body;
        //Data validation
  
        if (!id || !title) { //|| !author || !price ||!category
            return res.send({
              status: 400,
              message: "Missing Book Details",
            });
          }
        
          if (typeof title !== "string" ) { //|| typeof author !== "string" || typeof category !== "string"
            return res.send({
              status: 400,
              message: "Invalid Data Format",
            });
          }
        //else if (price.length > 0 || price.length > 100) {
        //     return res.send({
        //       status: 400,
        //       message:
        //         "price can not smaller then 0",
        //     });
        //   }
         //find the todo
  const bookdetails = await InventoryModel.findOne({ _id: id });
  if (!bookdetails) {
    return res.send({
      status: 400,
      message: "Book not found",
    });
  }
  //check ownership
  if (bookdetails.username !== req.session.user.username) {
    return res.send({
      status: 401,
      message: "Not allowed to edit, authorisation failed",
    });
  }
  try {
    const updateedBook = await InventoryModel.findOneAndUpdate({_id:id},{
            title:title,
            author:author,
            price:price,
            category:category,
    });
  
    return res.send({
      status: 201,
      message: "Book Updated successfully",
      data: updateedBook,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }

});

app.post("/delete-book",isAuth,async(req,res)=>{
    const {id}=req.body;
        //Data validation
  
        if (!id) {
            return res.send({
              status: 400,
              message: "Missing Book Id Details",
            });
          }

  try {
    const updateedBook = await InventoryModel.findOneAndDelete({_id:id});
  
    return res.send({
      status: 201,
      message: "Book Delete successfully",
      data: updateedBook,
    });
  } catch (error) {
    return res.send({
      status: 500,
      message: "Database error",
      error: error,
    });
  }

});
app.get("/read-books", isAuth, async (req, res) => {
  //username
  const username = req.session.user.username;
  try {
    const books = await InventoryModel.find({ username: username });
    console.log(books);

    return res.send({ status: 200, message: "Read success", data: books });
  } catch (error) {
    return res.send(error);
  }
});

app.listen(PORT,()=>{
    console.log("server is running");
})