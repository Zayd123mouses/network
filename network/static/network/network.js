document.addEventListener('DOMContentLoaded', function() {
//    check if user is logged in
     is_looged = document.getElementById("is_logged").value
    // all data at one.
    Posts()
    //wait untill making a new post 
    document.querySelector("#new_post_form").onsubmit = function (){
        new_post();}

    
    document.querySelector("#all_posts_button").addEventListener('click', function() {
        if(window.location.pathname != '/home'){
            history.pushState({path: 'home'}, "", `/home`);

            document.querySelector('#all-posts-view').style.display = 'block';
            document.querySelector('#following_view').style.display = 'none';
            document.querySelector('#new_post_container').style.display = 'block';
            }
 
            })
    if(is_looged == 'True'){
    document.querySelector("#followingPosts").addEventListener('click', function() {
        if(window.location.pathname != '/followingPosts'){
            history.pushState({path: 'followingPosts'}, "", `/followingPosts`);
            followingPosts();}

        })
    }
       
         
        // // if used the url directly
        // if(window.location.pathname === '/followingPosts'){
            
        //     followingPosts()
        // } else if(window.location.pathname === '/home'){
        //     history.replaceState({path: 'home'}, "", `/home`);
        // }

   },{ once: true });






    

   window.onpopstate = function(event) {
    if(event.state.path === 'home'){
        // do not relode and just show the page
        history.replaceState({path: 'home'}, "", `/home`);
        document.querySelector('#all-posts-view').style.display = 'block';
        document.querySelector('#following_view').style.display = 'none';
        document.querySelector('#new_post_container').style.display = 'block';
    } else if(event.state.path === 'followingPosts'){
        history.replaceState({path: 'followingPosts'}, "", `/followingPosts`)
        
        followingPosts()
    }
   
}

function Show(view){
    divs = document.querySelector(".body").children;
    for (let i = 0; i < divs.length; i++) {
        divs[i].style.display = "none";
    }
    document.getElementById(view).style.display = 'block'
}


function Posts(){
        Show("all-posts-view")
        document.querySelector("#new_post_container").style.display = 'block'

        fetch(`all_posts`,{
            headers: new Headers({ 'pageNumber': 1})
        })
        .then(response => response.json())
        .then(results => {
            let page = 1;
            let post_num = 0
            let next = true
            let numberOfPosts = results.posts.length

            ten_posts()


            function ten_posts(){
                
                for(i = post_num; i < page * 10; i++){
                    if(i < numberOfPosts){
                        Add_post(results.posts[i])
                    post_num ++;
                    }
                    
                    
                }

            }
            console.log(results)


            function next_button(){
                let button = document.createElement("button")
                button.setAttribute("id","next")
                button.appendChild(document.createTextNode('Next'))
                document.querySelector("#all-posts-view").appendChild(button)
                button.addEventListener("click",next_page);
                }


            function previous_button(){
                console.log("test")
                let button = document.createElement("button")
                button.setAttribute("id","previous")
                button.appendChild(document.createTextNode('Back'))
                document.querySelector("#all-posts-view").appendChild(button)
                button.addEventListener("click",previous_page);
                }
    


            function previous_page(){
                    page = (page - 1)
                    console.log(page)
                    post_num = (page * 10) - 10
                       
                    document.querySelector("#all-posts-view").innerHTML = ''
                     ten_posts()
                        
                    if(page != 1){
                        previous_button()
                    }
                    next_button()
                    
                }   

            function next_page(){
                page += 1 
                console.log(page)

                document.querySelector("#all-posts-view").innerHTML = ''
                ten_posts()

                if(post_num < numberOfPosts){
                     next_button()
                    }
                 previous_button()
                      
            }
    
            if(numberOfPosts > 10){
                next_button()
            }
            })

    }


    let user_id;
fetch(`user_id`)
.then(response => response.json())
.then(result => {
    user_id = result.user
    console.log(result)
            })


function Add_post(post){
    let div = document.createElement("div")
    div.setAttribute('id', 'post');
    div.setAttribute('class', 'post');
    div.innerHTML = ` <p>${post.timestamp} <p> 
                      <h1 onclick="profile(${post.author_id});" class="capitalize">${post.author} </h1>
                      <p id="post-content-${post.id}">${post.post}</p>
                      <p id="likes-count-${post.id}">${post.likes}</p> `

    if(post.author_id === user_id){
        let button = document.createElement("button")
        button.setAttribute("id","edit")
        button.appendChild(document.createTextNode('Edit'))
        div.appendChild(button)
    } 

    fetch(`liked_posts/${post.id}`)
    .then(response => response.json())
    .then(liked => {
        let like_button = document.createElement("button")
        like_button.setAttribute("id",`like-${post.id}`)
            
        if(liked.liked === false){
            like_button.appendChild(document.createTextNode("Like"))
        } else {
            like_button.appendChild(document.createTextNode("Liked!"))
        }
        div.appendChild(like_button)

        like_button.addEventListener("click",function(){
            LikeAndUnlike(post.id)
        })
    })


   if(window.location.pathname === '/home'){
    document.querySelector("#all-posts-view").appendChild(div)
   }


}



function LikeAndUnlike(post_id){
    if(is_looged !='True'){
        window.location.pathname = 'login'
    }
    console.log(post_id)
    
    
    
    fetch(`like`, {
                 method: 'POST',
                 body: JSON.stringify({
                  post_id: post_id                 
                   })
                })
   .then(response => response.json())
   .then(states=> {
    
      let like_button = document.querySelector(`#like-${post_id}`)
      let num_likes = states.num_likes;
      if(states.already_liked === true){
        like_button.innerHTML = 'Like'
      } else{
        like_button.innerHTML = 'Liked!'
      }

      document.querySelector(`#likes-count-${post_id}`).innerHTML = num_likes

   })
          
}





















































// //    load all the posts
// function all_posts(){

//     document.querySelector('#all-posts-view').style.display = 'block';
//     document.querySelector('#following_view').style.display = 'none';
//     document.querySelector('#new_post_container').style.display = 'block';

//     document.querySelector('#all-posts-view').innerHTML = '';

//         fetch(`all_posts`,{
//              headers: new Headers({ 'secure': 'secure'})
//             })
//         .then(response => response.json())
       
//         .then(posts => {
//              console.log(posts)

//             posts.forEach(function(post) {
//                 let div = document.createElement("div");
//                  div.setAttribute('id', 'post');
//                  div.setAttribute('class', 'posts');
                

//                try{
//                  fetch(`liked_posts/${post.id}`)
//                 .then(response => response.json())
//                 .catch(error => {console.log(error)})
                
//                   .then(likers => {
//                       likers.forEach(liker =>{
//                           console.log(liker)
                        
//                           if(post.author_id == request_user){
//                               if(liker.like_post == post.id){

//                                   div.innerHTML = ` <a href='/profile/${post.author}'  role='link'  id='profile-page' data-profile=${post.author_id} data-name=${post.author} > <P>${post.timestamp}</p> <h1 class="capitalize">${post.author}</h1></a>  <h3>${post.post}</h3>  <p>${post.likes}</p> <button class='liked' onclick='unlike(${post.id},this);'>Liked</button>  <button>Edit</button>`
//                               }
                             
//                           }else{
//                               if(liker.liker_id == request_user){
//                                   console.log(liker.liker_id)
//                                   div.innerHTML = ` <a href='/profile/${post.author}'  role='link'  id='profile-page' data-profile=${post.author_id} data-name=${post.author} > <P>${post.timestamp}</p> <h1 class="capitalize">${post.author}</h1></a>  <h3>${post.post}</h3>  <p>${post.likes}</p> <button class='liked' onclick='unlike(${post.id},this);'>Liked</button>`
  
//                               }                         
//                           }
                         
//                       })
                                     
//                   })
//                   if(post.author_id == request_user){
                      
                      
//                       div.innerHTML = ` <a  href="{% url 'profile' ${post.author}%}" role='link'  id='' data-profile=${post.author_id} data-name=${post.author} > <P>${post.timestamp}</p> <h1 class="capitalize">${post.author}</h1></a>  <h3>${post.post}</h3>  <p id='likes${post.id}'>${post.likes}</p> <button onclick='likes(${post.id},this);'>Likes</button>  <button>Edit</button>`
//                   }else {
                    
                      
//                   div.innerHTML = ` <a href='/profile/${post.author}'  role='link'  id='profile-page' data-profile=${post.author_id} data-name=${post.author} > <P>${post.timestamp}</p> <h1 class="capitalize">${post.author}</h1></a>  <h3>${post.post}</h3>  <p>${post.likes}</p> <button onclick='style.color = "red"' onclick='like(${post.id});'>Likes</button>`
//                   }
//                   document.querySelector("#all-posts-view").append(div);
                    
//                } catch {
//                 if(post.author_id == request_user){
                      
                      
//                     div.innerHTML = ` <a href='/profile/${post.author}'  role='link'  id='profile-page' data-profile=${post.author_id} data-name=${post.author} > <P>${post.timestamp}</p> <h1 class="capitalize">${post.author}</h1></a>  <h3>${post.post}</h3>  <p id='likes${post.id}'>${post.likes}</p> <button onclick='style.color = "red"' onclick='like(${post.id});'>Likes</button>  <button>Edit</button>`
//                 }else {
                  
                    
//                 div.innerHTML = ` <a href='/profile/${post.author}'  role='link'  id='profile-page' data-profile=${post.author_id} data-name=${post.author} > <P>${post.timestamp}</p> <h1 class="capitalize">${post.author}</h1></a>  <h3>${post.post}</h3>  <p>${post.likes}</p> <button onclick='style.color = "red"' onclick='like(${post.id});'>Likes</button>`
//                 }
//                 document.querySelector("#all-posts-view").append(div);
                  

//                }
                                                            
//            })
//         })  
// }
   
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



// function followingPosts(){
//     document.querySelector('#all-posts-view').style.display = 'none';
//     document.querySelector('#following_view').style.display = 'block';
//     document.querySelector('#new_post_container').style.display = 'none';

//     document.querySelector('#following_view').innerHTML = ''
//     fetch(`followingPosts`,{
//         headers: new Headers({ 'secure': 'secure'}),
//         dataType: 'json',
//         // prvent cache when clicking back button
//         cache: 'no-store'
//        })
//    .then(response => response.json())
  
//    .then(posts => {
//     console.log(posts)
//         posts.forEach(function(post){

//             for(i = 0; i < post.length; i++){
            
//               let div = document.createElement("div");
//                   div.setAttribute('id', 'following_post'); 
//                   div.setAttribute('class', 'posts');
//                   console.log(post[i].author)
//                   div.innerHTML = ` <a href='profile/${post[i].author}'   id='profile-page' data-profile=${post[i].author_id} data-name=${post[i].author} > <P>${post[i].timestamp}</p> <h1 class="capitalize">${post[i].author}</h1></a>  <h3>${post[i].post}</h3>  <p>${post[i].likes}</p> <button>Likes</button>`
//                   document.querySelector("#following_view").append(div);  }

//         })
//    })
    
//     console.log("test the function")
// }



// function load_user_posts(user){
//     document.querySelector('#all-posts-view').style.display = 'none';
//     document.querySelector('#following_view').style.display = 'none';
//     document.querySelector('#new_post_container').style.display = 'none';


//     fetch(`/posts/${user}`)
//    .then(response => response.json())
//      .then(posts => {
//         posts.forEach(function(post){
//             let div = document.createElement("div");
//             div.setAttribute("id","posts")
//             div.setAttribute('class', 'posts');
//             div.innerHTML = ` <a href='/profile/${post.author}'   id='profile-page' data-profile=${post.author_id} data-name=${post.author} ><P>${post.timestamp}</p><h1 class='capitalize'>${post.author}</h1></a>  <h3>${post.post}</h3>  <p>${post.likes}</p> <button>Likes</button> `
//             document.querySelector("#padding").append(div)
//            console.log(post)

//         })
       
//      })

//  }



// function unlike(post_id,that){
//     that.innerHTML = 'Like';
//     alert(that.className)

//      fetch(`unlike/${post_id}`, {
//          method: 'POST',
//           body: JSON.stringify({
//           post_content: document.querySelector("#post_content").value,                 
//            })
  
//            })
  
//           .then(response => response.json())
//            .then(result => {
//                console.log(result)
//                  })                   
// }




// function likes(post_id,that){
    
//     fetch(`like/${post_id}`, {
//         method: 'POST',
       
//           })
 
//          .then(response => response.json())
//           .then(result => {
//               console.log(result)
//                 })
//     document.querySelector(`#likes${post_id}`).innerHTML = (parseInt(document.querySelector(`#likes${post_id}`).innerHTML) + 1)
//     that.innerHTML = 'Liked'


// }

























































// document.addEventListener('DOMContentLoaded', function() {

//     document.querySelector("#new_post_form").addEventListener("submit",() => new_post())
//     document.querySelector("#all-posts-button").onclick = function(){
        
//     }
//         }
//     })



      

// console.log(window.location.pathname)
// if(window.location.pathname === '/home' || window.location.pathname === '/'){
//     all_posts();
// }
// else{
//     console.log(window.location.pathname.slice(1))
//      profile(window.location.pathname.slice(1))
//     path = window.location.pathname

// }


// window.onpopstate = function(event) {
//     alert(window.location.pathname)
//     route = event.state.path
//     if(route === 'home'){
//         document.querySelector('#all-posts-view').style.display = 'block';
//           document.querySelector('#profile-view').style.display = 'none';
//          document.querySelector('#new_post_container').style.display = 'block';
//     }
//     else if(route === 'profile'){
//         document.querySelector('#all-posts-view').style.display = 'none';
//           document.querySelector('#profile-view').style.display = 'block';
//          document.querySelector('#new_post_container').style.display = 'none';
//     }
// }


    
// })



// function all_posts(){    
//       // each time the function is called save it in the history
//          history.pushState({path: 'home'},'','home');
//     //     // Show the mailbox and hide other views
        
//         document.querySelector('#all-posts-view').style.display = 'block';
//           document.querySelector('#profile-view').style.display = 'none';
//          document.querySelector('#new_post_container').style.display = 'block';
    
//          document.querySelector('#all-posts-view').innerHTML = '';
      
//         // Get the posts from the server
//          fetch(`all_posts`)
//          .then(response => response.json())
//          .then(posts => {
    
//             console.log(posts)
//              posts.forEach(function(post) {
                
                
//                  let div = document.createElement("div");
//                  div.setAttribute('id', 'post'); 
               
//                  div.innerHTML = ` <a   id='profile-page' data-profile=${post.author_id} data-name=${post.author} ><h1>${post.author}</h1></a>  <h3>${post.post}</h3>  <p>${post.likes}</p> <button>Likes</button> <button>Comment</button>`
//                  document.querySelector("#all-posts-view").append(div);

//                  div.onclick = function(){
//                     profile(div.querySelector("#profile-page").dataset.name)
                    
//                  }
                           
//             })
    
//      })
//      }


// function new_post(){
   
//     fetch(`/new_post`, {
//       method: 'POST',
//       body: JSON.stringify({
//       post_content: document.querySelector("#post_content").value,                 
//        })

//        })

//        .then(response => response.json())
//         .then(result => {
//             console.log(result)
//              })                   
// }



// function profile(user_name){
//     history.pushState({path: 'profile'},'',`${user_name}`);
//     const user =  user_name
    
//          document.querySelector('#all-posts-view').style.display = 'none';
//           document.querySelector('#profile-view').style.display = 'block';
//          document.querySelector('#new_post_container').style.display = 'none';
//          fetch(`profile/${user_name}`)
//          .then(response => response.json())
//          .then(posts => {
//             if(posts.message === 'Wrong user.'){
//                 let div =  document.createElement("div");
//                 div.setAttribute("id", "user_profile");
//             div.setAttribute("class", "user_profile");
//             div.innerHTML = `<h2 id='user_name'>${user_name.charAt(0).toUpperCase() + user_name.slice(1)}</h2> <h1>This user dose not exist</h1>`
//             document.querySelector('#profile-view').append(div);

//                 return fasle;
//             }

//             let div =  document.createElement("div");
//             div.setAttribute("id", "user_profile");
//             div.setAttribute("class", "user_profile");
//             div.innerHTML = `<h2 id='user_name'>${user_name.charAt(0).toUpperCase() + user_name.slice(1)}</h2>`
//             document.querySelector('#profile-view').append(div);
         
//             console.log(user_name)
//          })
// }































// //     //  addEventListener for multible buttons for diffrent smaller functions and discard the one large function that contain most of the work
// //     // divide each function separetly and push and pop state according to it
    
// //     document.querySelector("#new_post_form").onsubmit = function(){
// //         new_post();
// //     }


// //     // if the url already on the home page , disable the button
// //     document.querySelector('#all-posts-button').onclick = function(){

// //         if (window.location.href.indexOf("home") > -1) {
// //             return false;
// //           } 
// //     }
    
          
// // });


// // window.onpopstate = function(event) {
    
// //     if(event.state.home === 'home'){
// //         document.querySelector('#all-posts-view').style.display = 'block';
// //         document.querySelector('#profile-view').style.display = 'none';
// //         document.querySelector('#new_post_container').style.display = 'block';

// //     } else{ 
// //         load_profile(event.state.profile)
// //     }
           
// // }





// // function all_posts(){
// //     // each time the function is called save it in the history
// //     history.pushState({home: 'home'},'','home');
// //     // Show the mailbox and hide other views
    
// //      document.querySelector('#all-posts-view').style.display = 'block';
// //      document.querySelector('#profile-view').style.display = 'none';
// //      document.querySelector('#new_post_container').style.display = 'block';

// //      document.querySelector('#all-posts-view').innerHTML = '';
  
// //     // Get the posts from the server
// //     fetch(`all_posts`)
// //     .then(response => response.json())
// //     .then(posts => {

// //         console.log(posts)
// //         posts.forEach(function(post) {
            
            
// //             let div = document.createElement("div");
// //             div.setAttribute('id', 'post'); 
           
// //             div.innerHTML = ` <a   id='profile-page' data-profile=${post.author_id} data-name=${post.author}><h1>${post.author}</h1></a>  <h3>${post.post}</h3>  <p>${post.likes}</p> <button>Likes</button> <button>Comment</button>`
// //             document.querySelector("#all-posts-view").append(div);
                       
// //         })

// // })
// // }




// // function new_post(){
// //     alert("hello")
// //     return false;

// // }
















// // // function load_posts(action) {
// // //     // each time the function is called save it in the history
// // //     history.pushState({home: 'home'},'','home');
// // //     // Show the mailbox and hide other views
    
// // //      document.querySelector('#all-posts-view').style.display = 'block';
// // //      document.querySelector('#profile-view').style.display = 'none';
// // //      document.querySelector('#new_post_container').style.display = 'block';

// // //      document.querySelector('#all-posts-view').innerHTML = '';
  
// // //     // Get the posts from the server
// // //     fetch(`/posts/${action}`)
// // //     .then(response => response.json())
// // //     .then(posts => {

// // //         console.log(posts)
// // //         posts.forEach(function(post) {
            
            

// // //             let div = document.createElement("div");
// // //             div.setAttribute('id', 'post'); 
           
// // //             div.innerHTML = ` <a   id='profile-page' data-profile=${post.author_id} data-name=${post.author}><h1>${post.author}</h1></a>  <h3>${post.post}</h3>  <p>${post.likes}</p> <button>Likes</button> <button>Comment</button>`
// // //             document.querySelector("#all-posts-view").append(div);
            
            
            
// // //         })
        
// // //         document.querySelectorAll("#profile-page").forEach(profile => {

// // //             profile.onclick = function(){
// // //                 console.log(profile.dataset);

// // //                 document.querySelector("#all-posts-view").style.display = 'none';
// // //                 document.querySelector("#new_post_container").style.display = 'none';
// // //                 document.querySelector("#profile-view").style.display = 'block';

// // //                 history.pushState({profile: profile.dataset.profile}, "", `${profile.dataset.name}`);
             

// // //             }
// // //         })
     
// // //     })
    
// // //     // on submitting new post 
// // //     // Post the new post
// // //     document.querySelector("#new_post").onsubmit = () => {
        
// // //         fetch(`/posts/${action}`, {
// // //             method: 'POST',
// // //             body: JSON.stringify({
// // //                 post_content: document.querySelector("#post_content").value,
                
// // //             })
// // //           })
// // //           .then(response => response.json())
// // //           .then(result => {
// // //             console.log(result);
// // //           }) .catch(error => {
// // //             console.log("Faluir" + error)
// // //           })
// // //         return true;
// // //     }
    
    
// // //    }


// // // function load_profile(profile_id){
// // //      document.querySelector('#all-posts-view').style.display = 'none';
// // //      document.querySelector('#profile-view').style.display = 'block';
// // //      document.querySelector('#new_post_container').style.display = 'none';
// // //      fetch(`/profile/${profile_id}`)
// // //      .then(response => response.json())
// // //      .then(profile => {
// // //         console.log(profile)
// // //      })
// // // }


  
   

    




