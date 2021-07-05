import React from "react";
import "./style.scss";
import Popup from "./popup";
import { searchmess } from '../../actions/search_action';
import { searchMess } from '../../actions/user_action';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { ClickAwayListener } from '@material-ui/core';
import { Settings, Dots, Heart, Pencil, Phone, Photo, Sticker, Send, Ghost, Edit, Circle, CircleCheck, User, Users } from 'tabler-icons-react';
import { default as SearchBar } from 'tabler-icons-react/dist/icons/search'

class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            isError: false,
            result: [],
            groups:[],
            foundFoods: [],
            showResult: false,
            keyword: ""
        };
    }

    search(e){
        if (e.target.value == ""){
            this.setState({
                showResult: false,
                result: [],
            })
        }else{
            searchMess(e.target.value).then(response => {
                this.setState({
                    result: [...response.users],
                    groups: [...response.groups],
                    showResult: true,
                });
            })
        }
    }

    searchHandle(e){
        e.preventDefault();
        // console.log(e.target[0]);
        const keyword = e.target[0].value;
        this.props.dispatch(searchmess(keyword)).then((response) => {
            this.props.history.push(`/search/${keyword}`)
        })
    }

    render() {
        const { result, showResult,groups } = this.state;
        return (
            <div className="search">
                  <ClickAwayListener onClickAway={()=>this.setState({showResult:false})}>
                <div className="search-container">
                    <div className="content">
                        <form className="comment_form" onSubmit={(e) => this.searchHandle(e)}>
                            <div className="wrapper">
                            <SearchBar size={22} strokeWidth={1} color="grey" ></SearchBar>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        onChange={(e)=>{this.search(e)}}
                                    />
                            </div>
                        </form>
                      
                        <Popup isOpen={showResult} items={result} groups={groups} />
                      
                    </div>
                </div>
                </ClickAwayListener>
            </div>
        );
    }
}
export default connect()(withRouter(Search));