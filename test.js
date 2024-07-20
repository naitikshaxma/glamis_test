

let count = 10;
while(count <= 10){
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
    "name" : `demo glamis${count}`,
        "email_id" : `demo-glamis${count}@gla.ac.in`,
        "phone" : Math.floor(Math.random() * 10000000000),
        "password" : "demo@123",
        "confirm_password" : "demo@123"
    });

    const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow"
    };

    fetch("http://localhost:8000/api/v1/users/signup", requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.error(error));
    
    count++;
}