

let count = 0;
while(count < 100){
    fetch(`http://localhost:8000/api/v1/healthCheck`).then(res => res.json()).then(data => console.log(data))
    count++;
    console.log(count)
}