import React, { Component } from 'react';
import TagDisplay from './tagDisplay';
import './LoadmoreChart.scss'

const LoadmoreChart = (props) => {
    return ( 
        <div className="chart_container">
            <div className="chart_wrapper">
                <h5>{props.title}</h5>
                <TagDisplay 
                    list={props.topTenTags}
                    isShow={props.isShow?10:5}     
                /> 
                {
                props.isShow ?
                    <div className="see_more_container">
                        <button onClick={() => props.close()}>
                                Thu gọn
                        </button>
                    </div>
                    :<div className="see_more_container">
                        <button onClick={() => props.loadMore()}>
                                    Xem thêm
                        </button>
                    </div>
                } 
            </div>
        </div>
    );
}
export default LoadmoreChart;