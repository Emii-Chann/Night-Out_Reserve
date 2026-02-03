function validateForm(){

  
    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value;
    let password2 = document.getElementById("password2").value;
    let email = document.getElementById("email").value.trim();
    let phone = document.getElementById("phone").value.trim();


    document.querySelectorAll(".error").forEach(e => e.innerHTML="");
    document.getElementById("successMsg").innerHTML="";

    let valid = true;

   
    if(username.length < 4){
        document.getElementById("userError").innerHTML =  "<span style='color:#ff6b6b;'>Min. 4 karakter</span>";
    
        valid = false;
    }

    
    if(password.length < 8){
        document.getElementById("passError").innerHTML =  "<span style='color:#ff6b6b;'>Min. 8 karakter</span>";
        valid = false;
    }

   
    if(password !== password2){
        document.getElementById("pass2Error").innerHTML =  "<span style='color:#ff6b6b;'>Nem egyezik!</span>";
        valid = false;
    }

  
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        document.getElementById("emailError").innerHTML =  "<span style='color:#ff6b6b;'>Hibás email!</span>";
        valid = false;
    }


    let phoneRegex = /^[0-9]{9,12}$/;
    if(!phoneRegex.test(phone)){
        document.getElementById("phoneError").innerHTML =  "<span style='color:#ff6b6b;'>Hibás telefonszám!</span>";
        valid = false;
    }

    if(valid){
        document.getElementById("successMsg").innerHTML = "Sikeres regisztráció 🎉";
    }

    return false; 
}