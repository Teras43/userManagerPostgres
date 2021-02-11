function deleteUser(guid) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState === 4 && xhttp.status === 200) {
            window.location.reload();
        }
    };
    xhttp.open("POST", "/deleteUser", true);
    xhttp.setRequestHeader("userid", guid);
    xhttp.send();
}

function goToEdit(guid) {
    window.location.href = `/editUser?userid=${guid}`;
}

function sortAsc() {
    window.location.href = "/sortAsc";
}

function sortDesc() {
    window.location.href = "/sortDesc";
}
