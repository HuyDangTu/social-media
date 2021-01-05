import React from "react";

export default class Popup extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        const { items, isOpen, tags } = this.props;
        //Do not show popup
        if (!isOpen) return null;
        return (
            <div className="popup">
                <div className="container">
                    <div className="content">
                        <h5>Tài khoản</h5>
                        {items &&
                            items.map((item, idx) => {
                                return (
                                    <div className="item" key={idx}>
                                        <div className="user_infor_wrapper">
                                            <img src={item.avt} />
                                            <p>{item.userName}</p>
                                        </div>
                                    </div>
                                );
                            })
                        }
                        <h5>Thẻ</h5>
                        {tags &&
                            tags.map((tag, idx) => {
                                return (
                                    <div className="item" key={idx}>
                                        <div className="tag_infor_wrapper">
                                            <h6>#{tag.name}</h6>
                                            <p>{tag.posts.length} Bài viết</p>
                                        </div>
                                    </div>
                                );
                            })
                        }
                        {!items.length && <div className="warning"></div>}
                    </div>
                </div>
            </div>
        );
    }
}
