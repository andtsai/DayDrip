# Here go your api methods.

# Let us have a serious implementation now.

def get_posts():
    start_idx = int(request.vars.start_idx) if request.vars.start_idx is not None else 0
    end_idx = int(request.vars.end_idx) if request.vars.end_idx is not None else 0
    posts = []
    has_more = False
    rows = db().select(db.post.ALL, limitby=(start_idx, end_idx + 1))
    for i, r in enumerate(rows):
        if i < end_idx - start_idx:
            t = dict(
                id = r.id,
                title = r.title,
                postContent = r.postContent,
                is_public = r.is_public,
                postEmail=r.user_email               
            )
            posts.append(t)
        else:
            has_more = True
    email=get_user_email();
    logged_in = auth.user is not None
    return response.json(dict(
        posts=posts,
        email=email,
        logged_in=logged_in,
        has_more=has_more,
    ))

@auth.requires_signature()
def add_post():
    t_id = db.post.insert(
        title = request.vars.title,
        postContent = request.vars.postContent,
        is_public=False
    )
    t = db.post(t_id)
    response.flash=T("New Post Added");
    return response.json(dict(post=t))

@auth.requires_login()
@auth.requires_signature()
def del_post():
    db(db.post.id == request.vars.post_id).delete()
    response.flash=T("Post Deleted");
    return "ok"


@auth.requires_login()
@auth.requires_signature()
def toggle_public():
    q= (db.post.id==request.vars.post_id)
    row=db(q).select().first()
    if row.is_public==False:
        row.update_record(is_public=True)   
    else:
        row.update_record(is_public=False)
    return "ok"

@auth.requires_login()
@auth.requires_signature()
def finishEdit():
    q=(db.post.id==request.vars.post_id)
    row=db(q).select().first();
    row.update_record(title=request.vars.title);
    row.update_record(postContent=request.vars.postContent);
   