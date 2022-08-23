from django.contrib.auth.models import AbstractUser
from django.db import models
from django.views.generic import ListView



class User(AbstractUser):
    
    pass

class UserFollowing(models.Model):
    user_id = models.ForeignKey("User", on_delete=models.CASCADE,related_name="following")

    following_user_id = models.ForeignKey("User", on_delete=models.CASCADE,related_name="followers")

    # You can even add info about when user started following
    created = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('user_id', 'following_user_id',)

    def serialize(self):
        return {
            "followers": str(self.user_id),
            "following": str(self.following_user_id)
        }
    

class Like(models.Model):
    liker = models.ForeignKey("User", on_delete=models.CASCADE, related_name="likes")
    likes_post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="post_likes")
    def __str__(self):
        return f"{self.likes_post}"
    def serialize(self):
        return {
            "liker": str(self.liker),
            "liker_id": self.liker.id,
            "like_post": str(self.likes_post)
        }

class Comment(models.Model):
    commenter = models.ForeignKey("User", on_delete=models.CASCADE, related_name="comments")
    post = models.ForeignKey("Post", on_delete=models.CASCADE, related_name="post_comments")
    comment = models.TextField()


class Post(models.Model):
    author = models.ForeignKey("User", on_delete=models.CASCADE, related_name="author")
    post =  models.TextField(blank=False)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.IntegerField(default=0)
    comments = models.IntegerField(default=0)
    def __str__(self):
        return str(self.id)

    
    def serialize(self):
        return {
            "id": self.id,
            "author_id": self.author.id,
            "author": str(self.author.username),
            "post": self.post,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": self.likes
        }

        
class ContactListView(ListView):
    paginate_by = 10
    model = Post