import React from "react";
import "./style.scss";
import Popup from "./popup";
import { search } from '../../actions/search_action';
import { searchUser } from '../../actions/user_action';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';

class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errors: [],
            isError: false,
            result: [],
            tags:[],
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
            searchUser(e.target.value).then(response => {
                this.setState({
                    result: [...response.users],
                    tags: [...response.tags],
                    showResult: true,
                });
            })
        }
    }

    searchHandle(e){
        e.preventDefault();
        // console.log(e.target[0]);
        const keyword = e.target[0].value;
        this.props.dispatch(search(keyword)).then((response) => {
            this.props.history.push(`/search/${keyword}`)
        })
    }

    render() {
        const { result, showResult,tags } = this.state;
        return (
            <div className="search">
                <div className="search-container">
                    <div className="content">
                        <form className="comment_form" onSubmit={(e) => this.searchHandle(e)}>
                            <div className="wrapper">
                                <FontAwesomeIcon icon={faSearch} />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        onChange={(e)=>{this.search(e)}}
                                    />
                            </div>
                        </form>
                        <Popup isOpen={showResult} items={result} tags={tags} />
                    </div>
                </div>
            </div>
        );
    }
}
export default connect()(withRouter(Search));