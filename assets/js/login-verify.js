function verify()
        {
            var a =(document.getElementById("login-name").value).length;
            var b =(document.getElementById("login-pass").value).length;
            if(a==0|| b==0)
            {
                window.confirm("Enter your credentials");
                return false;
            }    

            else if(b <= 5)
            {
                window.alert("Enter strong password");
                return false;
            }
            else
            {
                window.alert("credentials done ");   
                return true;
            }

        }