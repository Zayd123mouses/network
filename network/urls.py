
from django.urls import path

from . import views
#  authintacate the api urls , and find a way to handle the problem when the user enter the url directlys
urlpatterns = [
    path("", views.index, name="index"),
    path("home", views.home, name="home"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("all_posts", views.all_posts, name="all_posts"),
    path("new_post", views.new_post, name="new_post"),
    path("profile/<str:userName>", views.profile, name="profile"),

    


    path("posts/<str:user>", views.user_posts, name="user_posts"),
    path("following", views.following, name="following"),
    path("unfollow", views.unfollow, name="unfollow"),
    path("followingPosts", views.followingPosts, name="followingPosts"),
    path("user_id", views.user_id, name="user_id"),
    path("liked_posts/<int:post_id>", views.liked_posts, name="liked_posts"),
    path("like", views.LikeAndUnlike, name="LikeAndUnlike"),
    path("unlike/<int:post_id>", views.unlike, name="unlike"),




    
    
]
