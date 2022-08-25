
from django.urls import path

from . import views
#  authintacate the api urls , and find a way to handle the problem when the user enter the url directlys
urlpatterns = [
    path("", views.index, name="index"),
    path("home", views.home, name="home"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("all_posts_view", views.all_posts_view, name="all_posts_view"),
    path("new_post", views.new_post, name="new_post"),
    path("profile/<str:username>", views.profile, name="profile"),

    


    path("following_posts_view", views.following_posts_view, name="following_posts_view"),
    path("user_id", views.user_id, name="user_id"),
    path("liked_posts/<int:post_id>", views.liked_posts, name="liked_posts"),
    path("like", views.LikeAndUnlike, name="LikeAndUnlike"),
    path("edit", views.Edit, name="edit"),
    path("followState/<str:username>", views.followState, name="followState"),
    path("followAndUnfollow", views.followAndUnfollow, name="followAndUnfollow"),
    path("profile_posts", views.profile_posts, name="profile_posts"),
   




    
    
]
