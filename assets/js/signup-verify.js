function verify()
        {
            var a =(document.getElementById("login-name").value);
            var b =(document.getElementById("login-pass").value);
            var c =(document.getElementById("full-name").value);
            var d =(document.getElementById("Email").value);
            
            if(a.length==0 || b.length==0 || c.length==0 || d.length==0)
            {
                window.confirm("Enter your credentials completely");
                return false;
            }    

            else if(b.length <= 5)
            {
                window.alert("Enter strong password");
                return false;
            }

            else if(!d.includes("@"))
            {
                window.alert("Enter the valid Email ID")
                return false;
            }
            
            else
            {
                window.alert("credentials done ");   
                return true;
            }

        }