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
def all_posts(request):
    
    # get all the posts 
    posts = Post.objects.all()
    posts = posts.order_by("-timestamp").all()
    #  each page contain only 10 posts
    paginator = Paginator(posts, 10)
    page_obj = paginator.object_list

    # page_number = request.GET.get('page')
    # page_obj = paginator.get_page(request.headers.get("pageNumber"))

    return JsonResponse({"has_next":"page_obj.has_next()",
                        "posts":[post.serialize() for post  in page_obj],
                        "has_previous":"page_obj.has_previous()"}
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

    

def profile(request,userName):
         
     user = User.objects.filter(username=userName)
     if not user:
         print(userName)
         return JsonResponse({"message": "Wrong user."}, status=404)
       

     posts = Post.objects.filter(author__username= userName)
     posts = posts.order_by("-timestamp").all()
     user_etin = User.objects.get(username=userName)
     followings = user_etin.following.all()
     following_data = [post.serialize() for post in followings]

     followers_data1 = user_etin.followers.all()
     followers_data2 = [post.serialize() for post in followers_data1]
     print(f"{followers_data2}")

    
     return render(request, 'network/profile.html',{
        'username': str(userName),
        'user_name': str(request.user),
        'post_count': Post.objects.filter(author__username =userName).count(),
        'followers_count': user_etin.followers.count(),
        'following_count': user_etin.following.count(),
        'followings' : following_data,
        'followers' : followers_data2
     })
     





def user_posts(request,user):
    if not User.objects.get(username=user):
        return JsonResponse({"message": "Invalid user"}, status=404)

    posts = Post.objects.filter(author__username=user)
    posts = posts.order_by("-timestamp").all() 
    return JsonResponse([post.serialize() for post in posts], safe=False)

     
@csrf_exempt
def following(request):
    if request.method != 'POST':
        return JsonResponse({"Error": "POST is required"}, status=301)
    
    data = json.loads(request.body)
    following_user = User.objects.get(username=data.get('following_new_user'))
    print(f"{data.get('following_new_user')}+++++++++++++++++")

    try:
        the_follower = User.objects.get(pk=request.user.id)
        following_user = User.objects.get(username=data.get('following_new_user'))
        print(f"{following_user} {request.user.id}, {following_user.id}")
        UserFollowing.objects.create(user_id=the_follower, following_user_id=following_user)
        return JsonResponse({"Success": "follow has been added"}, status=200)
    except:
        return JsonResponse({"ERROR": "Falied to follow the user"}, status=200)

   
@csrf_exempt
def unfollow(request):
    if request.method != 'POST':
        return JsonResponse({"Error": "POST is required"}, status=301)

    data = json.loads(request.body)
    unfollow_user = User.objects.get(username=data.get('unfollow'))
    user = User.objects.get(pk=request.user.id)
    the_unfollowing = UserFollowing.objects.get(user_id=user, following_user_id=unfollow_user)
    the_unfollowing.delete()
    return JsonResponse({"Success": "function is working"}, status=200)



def followingPosts(request):
    # try to do a serlize on an existing list to see what would be the result to elimnate the use of 2 for loops in diffrent places
    data = request.headers.get('secure')
    if data == 'secure':
        ready_list = []
        user = User.objects.get(pk=request.user.id)
        user_following = user.following.all()
        for followings in user_following:
            users = User.objects.get(pk=followings.id)
            posts = Post.objects.filter(author=users).order_by("-timestamp")
            ready_posts = [post.serialize() for post in posts]
            if ready_posts == []:
                pass
            else:
                ready_list.append(ready_posts) 
                print(ready_posts)
        return JsonResponse(ready_list, safe=False)
    else:
        return render(request, 'network/index.html')
    # how to pick the following posts in the ,ost efficent way? , using double query? or a for loob in the backend to load all of them and send them at once?
     
    


def user_id(request):
    user = request.user.id
    return JsonResponse({"user":user}) 
    


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



# still need to be tested...
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
def unlike(request,post_id):
    if request.method != 'POST':
       return JsonResponse({"Error": "Post is required"}, status=300)
    
    user = User.objects.get(pk=request.user.id)
    post = Post.objects.get(pk=post_id)
    num_likes = post.likes
    if num_likes == 0:
        return JsonResponse({"norice": "likes already zero"}, status=300)

    Post.objects.filter(pk=post_id).update(likes=num_likes - 1)
    to_remove = Like.objects.get(liker=user,likes_post=post)
    to_remove.delete()
    return JsonResponse({"sucess": "unlicked the post"}, status=300)
    
    










# # return all the posts available
# def all_posts(request):
#     posts = Post.objects.all()
#     posts = posts.order_by("-timestamp").all()
#     return JsonResponse([post.serialize() for post in posts], safe=False)



# @csrf_exempt
# def new_post(request):
#     if request.method != 'POST':
#         return JsonResponse({"error": "POST request required."}, status=400)

#     data = json.loads(request.body)
#     user = User.objects.get(pk=request.user.id)
#     new_post = Post.objects.create(author=user, post=data.get("post_content"))
#     return JsonResponse({"message": "Email sent successfully."}, status=201)

    




# def profile(request,user_name):
    
#     print(f"++++++++++++++{user_name}")
#     user = User.objects.filter(username=user_name)
#     if not user:
#         print("hello2")
#         return JsonResponse({"message": "Wrong user."}, status=404)

#     posts = Post.objects.filter(author__username= user_name)
#     posts = posts.order_by("-timestamp").all()
#     return JsonResponse([post.serialize() for post in posts], safe=False)


# # enter directly via url on browser
# def person(request,user_name):
#         return render(request, "network/index.html")
    





# @csrf_exempt
# def posts(request, action):
#     if request.method == 'POST':
#         # get the data from json and create new post 
#         data = json.loads(request.body)
#         user = User.objects.get(pk=request.user.id)
#         new_post = Post.objects.create(author=user, post=data.get("post_content"))
        
#         return JsonResponse({"message": "Email sent successful1`ely."}, status=201)
 
#     posts = Post.objects.all()
#     posts = posts.order_by("-timestamp").all()
#     return JsonResponse({"message": "Email sent successfully."}, status=201)

      

# # def profile(request, id):
# #     posts = Post.objects.filter(author=request.user.id)
# #     posts = posts.order_by("-timestamp").all()
# #     return JsonResponse([post.serialize() for post in posts], safe=False)

