import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './components/Home/index'
import Auth from './hoc/auth';
import RegisterLogin from './components/Register_login/index';
import Register from './components/Register_login/register';
import UserDashboard from './components/User';
import PostDetail from './components/Product';
import Newfeed from './components/NewFeed/index';
import StoryPage from './components/Story/StoryPage';
import Tag from './components/Tag';
import SearchResult from './components/SearchResult/index'
import PostEdit from './components/PostEdit';

import ResetUser from './components/Resetpass/index';
import ResetPass from './components/Resetpass/ResetPass';

import AdminLogin from './components/Admin/login/index';
import Dashboard from './components/Admin/dashboard/index';
import ReportDetail from './components/Admin/reportDetail/index';
import AccountPage from './components/Admin/Account/index';
import AddAccount from './components/Admin/Account/AddAccount/index';
import EditAccount from './components/Admin/Account/EditAccount/index'

import Profile from './components/Profile/index';
import UserProfile from './components/Profile/userProfile';
import ProfileSettings from './components/ProfileSettings/index';
import Message from './components/Message/index';
import Explore from './components/Explore/index';
import NotFoundPage from './components/notFoundPage';


// import photoEditor from './components/photoEditor/index';

const Routes = () =>{ 
  return(
    <Switch> 
        {/* Client route */}  
        <Route path="/post/create_post" exact component={Auth(UserDashboard, true)} />
        <Route path="/postDetail/:id" exact component={Auth(PostDetail, true)} /> 
        <Route path="/story" exact component={Auth(StoryPage, true)} /> 
        <Route path="/" exact component={Auth(Home, true)} />
        <Route path="/register_login" exact component={Auth(RegisterLogin, false)} />
        <Route path="/register" exact component={Auth(Register, false)} />
        <Route path="/newfeed" exact component={Auth(Newfeed, true)} />
        <Route path="/tag/:id" exact component={Auth(Tag, true)} /> 
        <Route path="/search/:keyword" exact component={Auth(SearchResult, true)} /> 
        <Route path="/post/edit" exact component={Auth(PostEdit, true)} /> 
        <Route path="/reset_password" exact component={Auth(ResetUser, false)} /> 
        <Route path="/reset_password/:token" exact component={Auth(ResetPass, false)} /> 
        <Route path="/user/:id" exact component={Auth(Profile, true)}></Route>
        <Route path="/message/inbox" exact component={Auth(Message, true)}></Route>
        <Route path="/profile" exact component={Auth(UserProfile, true)}></Route>
        <Route path="/profilesettings" exact component={Auth(ProfileSettings, true)}></Route>
        <Route path="/message/inbox/:id" component={Auth(Message, true)}></Route>
        <Route path="/message/inbox/:id" component={Auth(Message, true)}></Route>
        <Route path="/explore" component={Auth(Explore, true)}></Route>
        <Route path="/notfound" component={Auth(NotFoundPage, true)}></Route>

        {/* <Route path="/photoEdit" component={Auth(photoEditor, true)}></Route> */}

        {/* Admin route */}
        <Route path="/Admin/login" exact component={Auth(AdminLogin, false, "/Admin/login")} />
        <Route path="/Admin/Dashboard" exact component={Auth(Dashboard, true, "/Admin/login")} />
        <Route path="/Admin/ReportDetail/:id" exact component={Auth(ReportDetail, true, "/Admin/login")} />
        <Route path="/Admin/Account" exact component={Auth(AccountPage, true, "/Admin/login")} />
        <Route path="/Admin/Account/add_new" exact component={Auth(AddAccount, true, "/Admin/login")} />
        <Route path="/Admin/EditAccount" exact component={Auth(EditAccount, true, "/Admin/login")} />
        
    </Switch>
  )
}

export default Routes;
