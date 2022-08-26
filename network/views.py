import json
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from .models import User, Post, Like, Comment, UserFollowing



def home(request):
    if request.user.is_authenticated:
        logged = True
    else:
        logged = False 

    return render(request, "network/index.html",{"is_logged":logged})


def index(request):
    return HttpResponseRedirect('home')


def logState(request):
    if request.user.is_authenticated:
        logState = True
    else:
        logState = False
    return JsonResponse({"logState":logState})

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("home"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("home"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("home"))
    else:
        return render(request, "network/register.html")



# load all posts in the first route
def all_posts_view(request):
    
    # get all the posts 
    posts = Post.objects.all()
    posts = posts.order_by("-timestamp").all()
    #  each page contain only 10 posts
    paginator = Paginator(posts, 10)
    page_obj = paginator.object_list

    # page_number = request.GET.get('page')
    # page_obj = paginator.get_page(request.headers.get("pageNumber"))

    return JsonResponse({"posts":[post.serialize() for post  in page_obj]}
                        ,safe=False)


@csrf_exempt
def new_post(request):
    if request.method != 'POST':
        return JsonResponse({"Error": "method should include post"}, status=300)
    print("hello")
    data = json.loads(request.body)
    user = User.objects.get(pk=request.user.id)
    new_post = Post.objects.create(author=user, post=data.get("post_content"))
    return JsonResponse({"Message": "Post has been saved successfuly"}, status=201)

    

def profile(request,username):

    if request.headers.get("api") !="api":
        return home(request)

    else:
    #   get the user posts in reverse order
        posts = Post.objects.filter(author__username= username).count()
        user_profile = User.objects.get(username=username)
        pre_ready_followings = user_profile.following.all()
        user_profile_followings = [post.serialize() for post in pre_ready_followings]

        pre_ready_followers = user_profile.followers.all()
        user_profile_followers = [post.serialize() for post in pre_ready_followers]
        
        return JsonResponse({"posts_count":posts,  
                            "following": user_profile_followings,
                            "followers":  user_profile_followers ,
                            'followers_count': user_profile.followers.count(),
                            'following_count': user_profile.following.count()
                
                                })
     
def profile_posts(request):
    data = request.headers.get("path")
    index = data.rfind('/')
    profile_name = data[index+1:]
    print(profile_name)
    posts = Post.objects.filter(author__username=str(profile_name)).order_by("-timestamp")
    
    return JsonResponse({"posts":[post.serialize() for post  in posts]}, safe=False)


def following_posts_view(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect("home")

    if request.headers.get("api") != "api" :
        return home(request)
        

      # get all the posts 
    real_user = User.objects.get(pk=request.user.id)
    user_following = real_user.following.all()
    
    
    user_following_posts = []
    for user in user_following:
        print(f"{user.following_user_id.id}")
        for post in Post.objects.filter(author=User.objects.get(pk=user.following_user_id.id)):     
            user_following_posts.append({"id":post.id, "author_id":user.following_user_id.id, "author": post.author.username,"likes":post.likes,"post": post.post, "timestamp": post.timestamp})
           
    return JsonResponse({"posts":sorted(user_following_posts, key=lambda x: x['timestamp'], reverse=True)})

    # how to pick the following posts in the most efficent way? , using double query? or a for loob in the backend to load all of them and send them at once?     
    

# get the user id and send it to javascript
def user_id(request):
    user = request.user.id
    return JsonResponse({"user":user}) 
    

# to check if the user is on the like list when loading the posts
def liked_posts(request,post_id):
    if request.user.is_authenticated:

        user = User.objects.get(pk=request.user.id)
    try:
        
         if Like.objects.get(liker=user,likes_post=post_id):
             liked = True
         else:
             liked = False
    except:
        liked = False
    
    return JsonResponse({"liked":liked})



#Handle all the like and unlike actions
@csrf_exempt
def LikeAndUnlike(request):
    if request.method != 'POST':
       return JsonResponse({"Error": "Post is required"}, status=300)

    if not request.user.is_authenticated:
        return JsonResponse({"Error":"You must log in to like the post"}, status=400) 

    data = json.loads(request.body)
    post_id = data.get("post_id")

    user = User.objects.get(pk=request.user.id)
    likes_to_update = Post.objects.get(pk=post_id).likes
    try:
        if Like.objects.get(liker=user, likes_post=Post.objects.get(pk=post_id)):
            already_liked = True
            Post.objects.filter(pk=post_id).update(likes=likes_to_update - 1)
            Like.objects.get(liker=user, likes_post=Post.objects.get(pk=post_id)).delete()
    except:

        already_liked = False
        Post.objects.filter(pk=post_id).update(likes=likes_to_update + 1)
        Like.objects.create(liker=user, likes_post=Post.objects.get(pk=post_id))

    num_likes = Post.objects.get(pk=post_id).likes
    return JsonResponse({"sucess": "liked the post",
                          "num_likes": num_likes,
                          "already_liked":already_liked
                       })

@csrf_exempt
def Edit(request):
    if request.method != 'POST':
         return JsonResponse({"Error": "Post is required"}, status=300)
    
    data = json.loads(request.body)
    post_id = data.get("post_id")

    try:
        if Post.objects.get(pk=post_id):

            Post.objects.filter(pk=post_id).update(post = data.get("post_content"))
            state = True 
    except:
        state = False
    
    return JsonResponse({"state": state})

def followState(request,username):
    try:
        if UserFollowing.objects.get(user_id=User.objects.get(pk=request.user.id), following_user_id=User.objects.get(username=username)):
            print(UserFollowing(user_id=User.objects.get(pk=request.user.id), following_user_id=User.objects.get(username=username)))
            follow = True
    except:
        follow = False
    return JsonResponse({"follow":follow,
                         "username": str(request.user.username)                        
                         })


@csrf_exempt
def followAndUnfollow(request):
    data = json.loads(request.body)
    username = data.get("username")
    
    try:
        exist = UserFollowing.objects.get(user_id=User.objects.get(pk=request.user.id), following_user_id=User.objects.get(username=username))
        if exist:
            exist.delete()
            already_followed = True
    except:
        UserFollowing.objects.create(user_id=User.objects.get(pk=request.user.id), following_user_id=User.objects.get(username=username))
        already_followed = False
    
    return JsonResponse({"already_followed": already_followed,
                         "following_count": User.objects.get(username=username).followers.count()
                        })
