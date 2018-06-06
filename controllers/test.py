# These are functions for testing only.


def test_add():
    form = SQLFORM.factory(
        Field('title'),
        Field('postContent'),
    )
    return dict(form=form)
