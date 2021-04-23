import React, { Component } from 'react';
import { Dialog } from '@material-ui/core';
import Stories from 'react-insta-stories';


class StoryDisplay extends Component {
   
    storyCreate = (obj) => {
        return obj.storyList.map((item)=>{
            return {
                url: item.image.url,
                header: {
                   profileImage: obj.createdBy[0].avata,
                   heading: obj.createdBy[0].userName,
                   subheading:  obj.name
                },
                //seeMoreCollapsed: this.customCollapsedComponent
            }
        })
    }
    render() {
        return (
            <div>
                <Stories
                    stories={this.storyCreate(this.props.story)}
                    defaultInterval={2000}
                    width="26rem"
                    height="100%"
                />
            </div>
        );
    }
}

export default StoryDisplay;