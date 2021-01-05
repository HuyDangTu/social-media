import React, { Component } from 'react';
import { connect } from 'react-redux';
import Layout from '../Layout/index';
import './account.scss';
import { getAll, sort } from '../../../actions/account_actions';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withRouter } from 'react-router-dom';

class AccountPage extends Component {
    state = {
        limit: 4,
        skip: 0,
        sortBy: { type: "name", order: 1 },
        isloading: false
    }

    componentDidMount() {
        this.props.dispatch(getAll(
            this.state.limit, this.state.skip
        ));
    }
    loadmore = () => {
        this.setState({ isloading: true });
        let skip = this.state.skip + this.state.limit;
        this.props.dispatch(getAll(
            this.state.limit,
            skip,
            this.state.filter,
            this.props.reports.list,
        )).then(() => {
            sort(this.state.sortBy, this.props.reports.list)
            this.setState({
                skip: skip,
                isloading: false
            }, () => { console.log("here", this.props.reports.list) })
        })
    }
    order = (type) => {
        switch (type) {
            case "name":
                if (this.state.sortBy.type == "name") {
                    this.setState({ sortBy: { type: "name", order: this.state.sortBy.order * -1 } }, () => {
                        sort(this.state.sortBy, this.props.accounts.list)
                    })
                } else {
                    this.setState({ sortBy: { type: "name", order: 1 } }, () => {
                        sort(this.state.sortBy, this.props.accounts.list)
                    })
                }
                break;
            case "userName":
                if (this.state.sortBy.type == "userName") {
                    this.setState({ sortBy: { type: "userName", order: this.state.sortBy.order * -1 } }, () => {
                        sort(this.state.sortBy, this.props.accounts.list)
                    })
                } else {
                    this.setState({ sortBy: { type: "userName", order: 1 } }, () => {
                        sort(this.state.sortBy, this.props.accounts.list)
                    })
                }
                break;
            case "email":
                if (this.state.sortBy.type == "email") {
                    this.setState({ sortBy: { type: "email", order: this.state.sortBy.order * -1 } }, () => {
                        sort(this.state.sortBy, this.props.accounts.list)
                    })
                } else {
                    this.setState({ sortBy: { type: "email", order: 1 } }, () => {
                        sort(this.state.sortBy, this.props.accounts.list)
                    })
                }
                break;
        }

    }
    toDetail = (item) => {
        this.props.history.push(`/Admin/Account/${item._id}`);
    }

    render() {
        const { accounts } = this.props
        console.log()
        return (
            <div>
                <Layout page="account">
                    <div className="account">
                        <h4>Chào!</h4>
                        <h2>Danh sách </h2>
                        <div className="button">
                            <button className="add_btn" onClick={() => {this.props.history.push("/Admin/Account/add_new")}}>Thêm mới</button>
                            <div class="dropdown filter">
                                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    {this.state.sortBy.type}
                                </button>
                                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <a class="dropdown-item" href="#" onClick={() => this.order("name")}>Tên</a>
                                    <a class="dropdown-item" href="#" onClick={() => this.order("userName")}>Tên người dùng</a>
                                    <a class="dropdown-item" href="#" onClick={() => this.order("email")}>Email</a>
                                </div>
                            </div>
                        </div>
                        {
                            accounts.list ?
                                <table className="report-list">
                                    <tr className="table-header">
                                        <th className="img"></th>
                                        <th className="name">Tên</th>
                                        <th className="role">Vai trò</th>
                                        <th className="userName" >Username</th>
                                        <th className="email" >Email</th>
                                    </tr>
                                    {
                                        accounts.list.map((item) => (
                                            <tr className="table-content" onClick={() => this.toDetail(item)}>
                                                <td><img className="avt" src={item.avt} /></td>
                                                <td className="name">
                                                    {item.name}
                                                </td>
                                                <td className="role">Admin</td>
                                                <td className="userName">  {item.userName}</td>
                                                <td className="email">{item.email}</td>
                                            </tr>
                                        ))
                                    }
                                </table>
                                : <LinearProgress />
                        }
                        {
                            this.state.isloading ?
                                <LinearProgress />
                                :
                                accounts.size >= this.state.limit ?
                                    <button className="loadmore" onClick={() => { this.loadmore() }}>Load more</button>
                                    : ""
                        }
                    </div>
                </Layout> 
            </div>
        );
    }
}

function mapStateToProps(state) {
    return {
        accounts: state.accounts
    };
}

export default connect(mapStateToProps)(withRouter(AccountPage));