document.addEventListener("click", function (event) {
    if (event.target.classList.contains("add-book")) {
        event.preventDefault()
        const title = document.getElementById("title").value;
        const author = document.getElementById("author").value;
        const price = document.getElementById("price").value;
        const category = document.getElementById("category").value;
        
        if (title === "" ||author==="" || price === "" || category==="") {
            alert("Please enter the All book details");
          }
          axios
          .post("/add-book", {title, author,price,category})
          .then((res) => {
            if (res.data.status !== 201) {
              alert(res.data.message);
              return;
            }
            document.getElementById("title").value="";
            document.getElementById("author").value="";
            document.getElementById("price").value="";
             document.getElementById("category").value="";
             genrateBooks()
          })
          .catch((err) => {
            console.log(err);
            alert(err);
          });

    }
    if (event.target.classList.contains("edit-me")) {
        const id = event.target.getAttribute("data-id");
        const title = prompt("Enter new title:");
        axios
            .post("/edit-book", { id, title })
            .then((res) => {
                if (res.data.status !== 201) {
                    alert(res.data.message);
                    return;
                }
                genrateBooks()
            })
            .catch((err) => {
                console.log(err);
                alert(err);
            });

    } else if (event.target.classList.contains("delete-me")) {
        const id = event.target.getAttribute("data-id");
        axios
            .post("/delete-book", { id })
            .then((res) => {
                if (res.data.status !== 201) {
                    alert(res.data.message);
                    return;
                }
                genrateBooks()
            }).catch((err) => {
                console.log(err);
                alert(err);
            });
    }
})
function genrateBooks() {
    axios.get("/read-books").then((res)=>{
        const books =res.data.data;
        const itemList = document.getElementById("item-list");

        // Clear the item-list before appending new elements
        itemList.innerHTML = '';

        // Append new elements to the item-list
        itemList.insertAdjacentHTML(
            "beforeend",
            books
                .map((item) => {
                    return `<div class="col-md-3 mx-3 py-2">
                        <div class="card">
                          <div class="card-body">
                            <h3 class="card-title item-text">${item.title}</h3>
                            <h6 class="card-subtitle mb-2 text-muted">By ${item.author}</h6>
                            <p class="card-text"><b>Book ${item.category}</b></p>
                            <button class="edit-me card-link btn btn-primary" data-id="${item._id}">Update</button>
                            <button class="delete-me card-link btn btn-danger" data-id="${item._id}">Delete</button>
                          </div>
                        </div>
                      </div>`;
                })
                .join("")
        );
    }).catch((err) => {
        console.log(err);
    });
}
window.onload = function () {
    genrateBooks();
  };