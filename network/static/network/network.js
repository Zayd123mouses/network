document.addEventListener('DOMContentLoaded', function() {

//    check if user is logged in
const is_looged = document.getElementById("is_logged").value

let first_time = true
let first_time_home = true
let first_time_profile = true


    // Handle routing if the user typed the url into the browser
    if(window.location.pathname === '/home'){
        history.pushState({path: 'home'}, "", `/home`);
        Posts("all_posts_view")
        first_time_home = false
    }else if(window.location.pathname === '/following_posts_view'){
        history.pushState({path: 'following_posts_view'}, "", `/following_posts_view`)
        followingPosts("following_posts_view")
        first_time = false
    } else if(window.location.href.indexOf("profile") > -1){
        Load_profile(window.location.pathname.split('/').pop())

    }


    // limit how many charachter the user type into the new post textarea
    const input = document.querySelector("#post_content"),
    counter = document.querySelector(".counter"),
    maxLength = input.getAttribute("maxlength");

    input.onkeyup = ()=>{
      counter.innerText = maxLength - input.value.length;
    }

    //wait untill making a new post 
    document.querySelector("#new_post_form").onsubmit = function (){
        new_post();}

    
    document.querySelector("#all_posts_button").addEventListener('click', function() {
        if(window.location.pathname != '/home'){
            history.pushState({path: 'home'}, "", `/home`);
            if(first_time_home === true){
                Posts("all_posts_view")
            }else{
                Show("all_posts_view")
                document.getElementById("new_post_container").style.display = 'block'
            }
            
            }
 
            })

    if(is_looged == 'True'){
        document.getElementById("profile_layout_button").addEventListener("click",()=>{
                   if(first_time_profile === true){

                   
                    Load_profile(document.getElementById("profile_layout_button").innerHTML)
                    first_time_profile = false
                   }else{

                   
                        Show("profile")
                        divs = document.querySelector("#profile").children;
                    for (let i = 0; i < divs.length; i++) {
                        divs[i].style.display = "none";
                    }
                        document.getElementById(`profile-` + document.getElementById("profile_layout_button").innerHTML).style.display = 'block'
                        history.pushState({path: 'profile'}, "", `/profile/${document.getElementById("profile_layout_button").innerHTML}`)

                }       
        })
       

    document.querySelector("#followingPosts").addEventListener('click', function() {
        if(window.history.state['path'] !== 'following_posts_view'){
            history.pushState({path: 'following_posts_view'}, "", `/following_posts_view`);
            if(first_time === true){
                followingPosts("following_posts_view");
                first_time = false
            } else {
                Show("following_posts_view")
            }
          
            }
            
        })
    }

  

   },{once : true});






   window.onpopstate = function(event) {
    console.log(event.state.path + "++++++++++++++++++++++++++++++++++")
    if(event.state.path === 'home'){
        // do not relode and just show the page
       Show("all_posts_view")
       document.getElementById("new_post_container").style.display = 'block'
        

    } else if(event.state.path === 'following_posts_view'){
        Show("following_posts_view")
        document.getElementById("new_post_container").style.display = 'block'

    }else if (event.state.path.indexOf("profile") > -1){
         Load_profile(window.location.pathname.split('/').pop())  
       
                                                       }
   
}


function Show(view){
    
    divs = document.querySelector(".body").children;
    for (let i = 0; i < divs.length; i++) {
        divs[i].style.display = "none";
    }
    document.getElementById(view).style.display = 'block'
}
 

function Posts(view){
    console.log(view)
       document.getElementById(view).innerHTML = ''
    // show only the all-post view
        Show(view)
        document.getElementById("new_post_container").style.display = 'block'
        //  get all posts at once with a single request to the server
        
        fetch(`/`+view,{
            headers: new Headers({ 'pageNumber': 1, 'path': window.location.pathname, "api":"api"})
        })
        .then(response => response.json())
        .then(results => {
            let page = 1;
            let post_num = 0
            let next = true
            let numberOfPosts = results.posts.length

            ten_posts()

            // mimic pagination on the clinet side without multible request to the server
            function ten_posts(){
                
                for(i = post_num; i < page * 10; i++){
                    if(i < numberOfPosts){
                        Add_post(results.posts[i])
                    post_num ++;
                    }
                    
                    
                }

            }
            console.log(results)

            
            function next_button(view){
                let button = document.createElement("button")
                button.setAttribute("id","next")
                button.appendChild(document.createTextNode('Next'))
                document.getElementById(view).appendChild(button)
                button.addEventListener("click",()=>{
                    window.scrollTo(0, 0);

                    next_page(view)
                });
                }


            function previous_button(view){
                console.log("test")
                let button = document.createElement("button")
                button.setAttribute("id","previous")
                button.appendChild(document.createTextNode('Back'))
                document.getElementById(view).appendChild(button)
                button.addEventListener("click",()=>{
                    previous_page(view)
                });
                }
    

            function previous_page(view){
                    page = (page - 1)
                    console.log(page)
                    post_num = (page * 10) - 10
                       
                    document.getElementById(view).innerHTML = ''
                     ten_posts()
                        
                    if(page != 1){
                        previous_button(view)
                    }
                    next_button(view)
                    
                }   

            function next_page(view){
                page += 1 
                console.log(page)

                document.getElementById(view).innerHTML = ''
                ten_posts()

                if(post_num < numberOfPosts){
                     next_button(view)
                    }
                 previous_button(view)
                      
            }
    
            if(numberOfPosts > 10){
                next_button(view)
            }
            })

    }

// get the current user id
// the only fetch that the varaible stayd the same outside fetch and I do not know how
    let user_id;
fetch(`/user_id`)
.then(response => response.json())
.then(result => {
    user_id = result.user
    console.log(result)
            })




// creating the post and appending it
function Add_post(post){
    let div = document.createElement("div")
    div.setAttribute('id', `post`);
    div.setAttribute('class', 'post');
    div.innerHTML = ` <p>${post.timestamp} <p> 
                      <h1 id="user-profile-${post.id}" class="capitalize">${post.author} </h1>
                      <p id="post-content-${post.id}">${post.post}</p>
                      <p id="likes-count-${post.id}">${post.likes}</p> 
                      `
  
   
    // check if the user in the author and if so , add an edit button
    if(post.author_id === user_id){
        let button = document.createElement("button")
        button.setAttribute("id",`edit-${post.id}`)
        button.setAttribute("data-bs-toggle",`modal`)
        button.setAttribute("data-bs-target",`#exampleModal`)
        button.setAttribute("type","button")
        button.setAttribute("class","btn btn-primary")
        button.appendChild(document.createTextNode('Edit'))
        div.appendChild(button)
        button.addEventListener("click",()=>{
           Edit(post.id)
        })
    } 
    // for each post ,  check if the user has liked this post before or not
    fetch(`/liked_posts/${post.id}`)
    .then(response => response.json())
    .then(liked => {
        let like_button = document.createElement("button")
        like_button.setAttribute("id",`like-${post.id}`)
        like_button.setAttribute("class","btn btn-primary")
            
        if(liked.liked === false){
            like_button.appendChild(document.createTextNode("Like"))
        } else {
            like_button.appendChild(document.createTextNode("Liked!"))
        }
        div.appendChild(like_button)
        //  listen for clicking the like button.
        like_button.addEventListener("click",function(){
            LikeAndUnlike(post.id)
        })
    })

   //  append the post according to what view the user on 
  
   if(window.history.state['path'] === 'home'){
    document.querySelector("#all_posts_view").appendChild(div)
   }else if(window.history.state['path'] === 'following_posts_view'){
    document.getElementById("following_posts_view").appendChild(div)
   }else{
    document.getElementById("profile_posts/" + window.location.pathname.split('/').pop()).appendChild(div)
   }
//    when click on the post author , load the profile
  document.querySelector(`#user-profile-${post.id}`).addEventListener("click",()=>{
    console.log("pleeeeeeeeeeeeeeeeeeeeeeeeeeease")
    try{
        if(window.state.path.indexOf("profile") > -1){
            document.getElementById(`profile-` + window.location.pathname.split('/').pop()).style.display = 'block'
         }
         Load_profile(post.author)
    }catch{
        Load_profile(post.author)
    }
   

    
  })

}

// create new post
function new_post(){
    if(document.querySelector("#post_content").value == ''){
        alert("Error: Post can not be empty")
        return false;
    }
  
        fetch(`/new_post`, {
          method: 'POST',
           body: JSON.stringify({
           post_content: document.querySelector("#post_content").value,                 
            })
                })
   
            .then(response => response.json())
             .then(result => {
                 console.log(result)
                  })                   
     }

    //  handle the like and unlike button in a single function
function LikeAndUnlike(post_id){
    // if the user is not logged and clicked on the like button , the user should be redirected to the login page
    const is_looged = document.getElementById("is_logged").value

    if(is_looged !='True'){
        window.location.pathname = 'login'
    }
    console.log(post_id)
     
    // sending the like or unlike action to the server
    fetch(`/like`, {
                 method: 'POST',
                 body: JSON.stringify({
                  post_id: post_id                 
                   })
                })
   .then(response => response.json())
   .then(states=> {
    
      let like_button = document.querySelector(`#like-${post_id}`)
      let num_likes = states.num_likes;
    //   check if the user has already liked the post and clicked on it again ,then unlike the post and vice versa
      if(states.already_liked === true){
        like_button.innerHTML = 'Like'
      } else{
        like_button.innerHTML = 'Liked!'
      }
    //   update the number of likes on the post
      document.querySelector(`#likes-count-${post_id}`).innerHTML = num_likes

   }).catch(err => {
    console.error(err);
    respondError(res, err);
  });
          
}


// how to prompt a model to stay on the same page ???
function Edit(post_id){
    console.log(post_id + "why the fuck everything keeps breaking")
    console.log( document.querySelector("#updated_post"))
    // get the original post and populate it with existing data
    let textarea_for_post = document.querySelector("#updated_post")
    textarea_for_post.value = document.querySelector(`#post-content-${post_id}`).innerHTML
    // listen for saving the change button
    document.querySelector("#save_updated_post").addEventListener("click",()=> {
        // get the new post content
        let new_post = document.querySelector("#updated_post")
        console.log(new_post.value)

        fetch(`/edit`, {
            method: 'POST',
             body: JSON.stringify({
             post_id: post_id,
             post_content: new_post.value             
              })
                  })
     
              .then(response => response.json())
               .then(result => {
                if(result.state === true){
                      document.querySelector(`#post-content-${post_id}`).innerHTML = new_post.value;
                } else{
                    console.log("Error: Something went wrong play try again")
                }
                
               }).catch(err => {
                console.error(err);
                respondError(res, err);
              });
    })

}

function followingPosts(view){
    Posts(view)
}







function Load_profile(author){
    Show("profile")
   
    console.log("Test Test" + author)
    
    fetch(`/profile/${author}`,{
        headers: new Headers({"api":"api"})
    })
    .then(response => response.json())
    .then(user => {
        divs = document.querySelector("#profile").children;
                    for (let i = 0; i < divs.length; i++) {
                        divs[i].style.display = "none";
                    }
        try{
            
            document.getElementById(`profile-${author}`).style.display = 'block'
            history.pushState({path: 'profile'}, "", `/profile/${author}`)

        }catch{
            
        
        


       let div_profile = document.createElement("div")
       div_profile.setAttribute("class","padding")
       div_profile.setAttribute("id",`profile-${author}`)
    
       div_profile.innerHTML = `
       <div class="col-md-8">
           <!-- Column -->
               <div class="card-body little-profile text-center">
                   <h3 class="capitalize" class="m-b-0"  id="profile_username">${author}</h3>
                   <!-- if there were no followers then show the follow button  -->
                   <p>Web Designer &amp; Developer</p> 
                   
                   <div id="follow_button_container_${author}"> </div>

                   
                   <br>
                   <hr>
                   <div class="row text-center m-t-20">
                       <div class="col-lg-4 col-md-4 m-t-20">
                           <h3 class="m-b-0 font-light" id="post_count">${user.posts_count}</h3><small><button type="button" class="btn btn-outline-primary" disabled>Posts</button></small>
                       </div>
                       <div class="col-lg-4 col-md-4 m-t-20">
                         <h3 class="m-b-0 font-light" id="follower_count">${user.followers_count}</h3><small><button type="button" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#Followers">Followers</button></small>
                     </div>
                     <div class="col-lg-4 col-md-4 m-t-20">
                         <h3 class="m-b-0 font-light" id="following_count">${user.following_count}</h3><small><button type="button" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#Following">Following</button></small>
   
                     </div>
   
                   </div>
   
               </div>
           </div>
           <br>
           <div id="profile_posts/${author}" class="relative"></div>
       </div>  
       `
        document.querySelector("#profile").append(div_profile)
        // fill the html page with the right data
        // document.getElementById("profile_username").innerHTML = author
        // document.getElementById("post_count").innerHTML = user.posts_count
        // document.getElementById("follower_count").innerHTML = user.followers_count
        // document.getElementById("following_count").innerHTML = user.following_count
       
        // divs for the list of follower and following of that user
        let div_follower = document.createElement("div")
        
        let div_followig = document.createElement("div")
        
        modal_following_content = document.querySelector("#modal_following_content")
        modal_followers_content = document.querySelector("#modal_followers_content")
        // clean after each request to ensure no existing data from the previous request
        modal_following_content.innerHTML = ''
        modal_followers_content.innerHTML = ''

    //    populate the previous divs with the name of followers or following
        function FollowingAndFollowers(Target,div_to_append){
            let h1 = document.createElement("h1")
            h1.setAttribute("class","capitalize")
            h1.setAttribute("id",`user-${Target}`)
            h1.setAttribute("data-bs-dismiss","modal")
            h1.appendChild(document.createTextNode(Target))
            h1.addEventListener("click",()=>{
                document.getElementById(`profile-${author}`).style.display = 'none'
                Load_profile(Target)
            })
            div_to_append.append(h1)
        }
        // for each following 
        user.following.forEach(following =>{
            FollowingAndFollowers(following.following,div_followig)
        })
        modal_following_content.appendChild(div_followig)
        
    //    for each follower
        user.followers.forEach(follower =>{
            FollowingAndFollowers(follower.followers,div_follower)
        })
        modal_followers_content.appendChild(div_follower)
// change the url 
history.pushState({path: 'profile'}, "", `/profile/${author}`)

//clean the pofile posts after each request 
document.getElementById(`profile_posts/${author}`).innerHTML = ''

// display the profile posts;
 Posts(`profile_posts/${author}`)
 document.querySelector("#profile").style.display = 'block'
 document.getElementById("new_post_container").style.display = 'none'

let follow_button = document.createElement("a")
follow_button.setAttribute("class", "m-t-10 waves-effect waves-dark btn btn-primary btn-md btn-rounded")
follow_button.setAttribute("id",`follow_button_${author}`)
follow_button.setAttribute("data-abc", "true")
const is_looged = document.getElementById("is_logged").value
if(is_looged != 'True'){
    follow_button.setAttribute("href","/login")
}


fetch(`/followState/${author}`)
.then(response=>response.json())
.then(user=>{
    console.log(user)
    console.log(author)
    // probelm with identfing the following
  if(user.username === author ){
    follow_button.style.display = 'none'
  } else {
           if(user.follow === true){
                follow_button.innerHTML = 'Unfollow'
           } else { 
                follow_button.innerHTML = 'Follow'
                  }  
                document.querySelector(`#follow_button_container_${author}`).appendChild(follow_button)
        }


    follow_button.addEventListener("click",()=>{
        if(user.username === author ){
            return
        }
        
        followAndUnfollow(author)
    })
})
    }
}).catch(err => {
    console.error(err);
    respondError(res, err);
  });

}



function followAndUnfollow(author){
fetch(`/followAndUnfollow`, {
    method: 'POST',
    body: JSON.stringify({
     username: author                 
      })
   })
.then(response => response.json())
.then(state=> {
        follow_button = document.querySelector(`#follow_button_${author}`)
        console.log(state)
        if(state.already_followed === true){
        follow_button.innerHTML = "Follow"
        } else {
            follow_button.innerHTML = "Unfollow"
        }
        document.getElementById("follower_count").innerHTML = state.following_count
        }).catch(err => {
            console.error(err);
            respondError(res, err);
          });



}