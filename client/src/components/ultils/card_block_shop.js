import React, { Component } from 'react';
import Card from '../ultils/card';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import './card_block_shop.scss';
const cardWidth = 100/3;
class CardBlockShop extends Component { 
    
    state={
        SnackMess: "",
        setSnack: false,
    }

    handleSnackBar = (mess)=>{
        this.setState({
            setSnack: true,
            SnackMess: mess
        })
    }

    renderCards = () => {
    return(
        this.props.list ? 
            this.props.list.map(card => (
                <Card 
                    key={card._id}
                    {...card} 
                    handleSnackBar={this.handleSnackBar}
                    grid={this.props.grid}
                />
            ))
        :null
    )}
    render(){
        return (
            <div className="card_block_shop">
                {this.props.list?
                    this.props.list.length === 0 ?
                        <div className="no_result">
                                "Sorry, no result"
                        </div>
                    :null
                :null}
                {this.renderCards()}
                <Snackbar
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left'
                    }}
                    open={this.state.setSnack}
                    onClose={() => this.setState({ setSnack: false })}
                    autoHideDuration={3000}>
                    <MuiAlert elevation={6} variant="filled" severity="success" message={this.state.SnackMess}>{this.state.SnackMess}</MuiAlert>
                </Snackbar>
            </div>
        );
    }
};

export default CardBlockShop;