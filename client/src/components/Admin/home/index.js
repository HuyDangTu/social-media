import React, { Component } from 'react';
import { connect } from 'react-redux';
import Layout from '../Layout/index';
import './dashboard.scss'
import { 
    getGrowthOfUsers, 
    getPercentageOfAge, 
    unusedAccountSinceBeginOfThisYear, 
    newPostThisMonth, newAccountThisMonth,
    numOfAccount,
    getTop10Users,
    getUserBehaviors ,
    getUsersNationality,
} from '../../../actions/statistics_action';
import { withRouter } from 'react-router-dom';
import DateFnsUtils from '@date-io/date-fns';
import {
    MuiPickersUtilsProvider,
    KeyboardDatePicker,
} from '@material-ui/pickers';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveChoropleth } from '@nivo/geo';
import { UserPlus, UserExclamation , Users ,Photo , Home2, TrendingUp,TrendingDown,Award } from 'tabler-icons-react';
import countries from './feature.json';
class Home extends Component {

    state={
        growthOfUserData: [{
            "id": "Users",
            "color": "hsl(276, 70%, 50%)",
            "data": [
            {
                "x": "1",
                "y": 0
            },
            {
                "x": "2",
                "y": 0
            },
            {
                "x": "3",
                "y": 0
            },
            {
                "x": "4",
                "y": 0
            },
            {
                "x": "5",
                "y": 0
            },
            {
                "x": "6",
                "y": 0
            },
            {
                "x": "7",
                "y": 0
            },
            {
                "x": "8",
                "y": 0
            },
            {
                "x": "9",
                "y": 0
            },
            {
                "x": "10",
                "y": 0
            },
            {
                "x": "11",
                "y": 0
            },
            {
                "x": "12",
                "y": 0
            }
            ]        
        }],
        percentageOfAge: [
            {
                "id": "Dưới 15",
                "label": "0 - 15",
                "value": 1
            },
            {
                "id": "Dưới 18",
                "label": "15 - 18",
                "value": 1
            },
            {
                "id": "Dưới 30",
                "label": "18 - 30",
                "value": 1
            },
            {
                "id": "Dưới 50",
                "label": "30 - 50",
                "value": 1
            },
            {
                "id": "Trên 50",
                "label": "50 - 120",
                "value": 1
            }
        ],
        userBehaviors: [
            {
                "id": "posts",
                "color": "hsl(167, 70%, 50%)",
                "data": [
                {
                    "x": "plane",
                    "y": 1
                },
                {
                    "x": "helicopter",
                    "y": 1
                },
                {
                    "x": "boat",
                    "y": 1
                },
                ]
            },
            {
                "id": "comments",
                "color": "hsl(67, 70%, 50%)",
                "data": [
                    {
                        "x": "plane",
                        "y": 2
                    },
                    {
                        "x": "helicopter",
                        "y": 2
                    },
                    {
                        "x": "boat",
                        "y": 2
                    },
                ]
            },
            {
                "id": "stories",
                "color": "hsl(162, 70%, 50%)",
                "data": [
                    {
                        "x": "plane",
                        "y": 3
                    },
                    {
                        "x": "helicopter",
                        "y": 3
                    },
                    {
                        "x": "boat",
                        "y": 3
                    },
                ]
            },
            {
                "id": "reports",
                "color": "hsl(103, 70%, 50%)",
                "data": [
                    {
                        "x": "plane",
                        "y": 4
                    },
                    {
                        "x": "helicopter",
                        "y": 4
                    },
                    {
                        "x": "boat",
                        "y": 4
                    },
                ]
            },
            ],
        nationality: [
            {
                "id": "AFG",
                "value": 985965
            },
            {
                "id": "AGO",
                "value": 200472
            },
            {
                "id": "ALB",
                "value": 3581
            },
            {
                "id": "ARE",
                "value": 430108
            },
            {
                "id": "ARG",
                "value": 900652
            },
            {
                "id": "ARM",
                "value": 266579
            },
        ],
        selectedDate: new Date(),
    }

    componentDidMount(){
        this.props.dispatch(getGrowthOfUsers(this.state.selectedDate.getFullYear())).then(response => {
            console.log(response)
            this.setState({
                growthOfUserData: [{
                    id: "Users",
                    color: "hsl(280, 70%, 50%)",
                    data: response.payload
                }]
            })
        })

        this.props.dispatch(getUserBehaviors(this.state.selectedDate.getFullYear())).then(response => {
            console.log(response)
            this.setState({
                userBehaviors: [
                    {
                        id: "Posts",
                        color: "hsl(280, 70%, 50%)",
                        data: response.payload.postsData
                    },
                    {
                        id: "stories",
                        color: "hsl(280, 70%, 50%)",
                        data: response.payload.storiesData
                    },
                     {
                        id: "comment",
                        color: "hsl(280, 70%, 50%)",
                        data: response.payload.commentsData
                    },
                    {
                        id: "reports",
                        color: "hsl(280, 70%, 50%)",
                        data: response.payload.reportsData
                    },
                ]
            })
        })

        this.props.dispatch(getPercentageOfAge(this.state.selectedDate.getFullYear())).then(response => {
            this.setState({
                percentageOfAge: response.payload
            })
        })

        this.props.dispatch(getUsersNationality(this.state.selectedDate.getFullYear())).then(response => {
             console.log(response)
            let data = []
            response.payload.map(item => {
                if(item._id.length>0){
                    data.push({
                        id: item._id[0].code,
                        value: item.count
                    })
                }
            })
            this.setState({
                nationality: data
            })
           
        })
        
        this.props.dispatch(unusedAccountSinceBeginOfThisYear())
        this.props.dispatch(newAccountThisMonth(this.state.selectedDate))
        this.props.dispatch(newPostThisMonth(this.state.selectedDate))
        this.props.dispatch(numOfAccount(this.state.selectedDate))
        this.props.dispatch(getTop10Users());
    }

    handleDateChange = (date) =>{
        
        // console.log(typeof date);
        this.setState({selectedDate: new Date(date)},()=>{
            this.props.dispatch(getGrowthOfUsers(this.state.selectedDate.getFullYear())).then(response => {
                console.log(response)
                this.setState({
                    growthOfUserData: [{
                        id: "Users",
                        color: "hsl(280, 70%, 50%)",
                        data: response.payload
                    }]
                })
            })

            this.props.dispatch(getPercentageOfAge(this.state.selectedDate.getFullYear())).then(response => {
                console.log(response)
                this.setState({
                    percentageOfAge: response.payload
                })
            })
            
            this.props.dispatch(getUsersNationality(this.state.selectedDate.getFullYear())).then(response => {
                console.log(response)
                let data = []
                response.payload.map(item => {
                    if(item._id.length>0){
                        data.push({
                            id: item._id[0].code,
                            value: item.count
                        })
                    }
                })
                this.setState({
                    nationality: data
                })
            })
            
            this.props.dispatch(unusedAccountSinceBeginOfThisYear())
            this.props.dispatch(newAccountThisMonth(this.state.selectedDate))
            this.props.dispatch(newPostThisMonth(this.state.selectedDate))
            this.props.dispatch(numOfAccount(this.state.selectedDate))
        })
    }

    calculate = (a,b) => {
        if(a==0) return ((b-a)/1)*100;
        else return ((b-a)/a)*100;
    }

    render() {
        return (
        <Layout page="home">
            <div className="title">
                <div className="title-wrapper">
                    <div className="title-icon">
                        <Home2
                            size={24}
                            strokeWidth={2}
                            color={'white'}
                        />
                    </div>
                    <p>Dashboard</p>
                </div>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardDatePicker
                        margin="normal"
                        id="date-picker-dialog"
                        label="Date picker dialog"
                        format="MM/dd/yyyy"
                        value={this.state.selectedDate}
                        onChange={this.handleDateChange}
                        KeyboardButtonProps={{
                            'aria-label': 'change date',
                        }}
                    />
                </MuiPickersUtilsProvider>
            </div>
            <div className="metric-wrapper">
                <div className="row no-gutters">
                    <div className="col-xl-3 col-lg-6 col-sm-6 col-12 no-gutters">
                        <div className="metric">
                            <UserPlus
                                size={48}
                                strokeWidth={2}
                                color={'black'}
                            />
                            <div className="content">
                                <p>New Users</p>
                                {this.props.statistics.newUsers?this.props.statistics.newUsers.usersThisMonth:"0"}
                            </div>
                            <div className="Difference">
                                {
                                    this.props.statistics.newUsers?
                                        this.props.statistics.newUsers.usersLastMonth
                                    :"0"
                                }
                                {
                                   this.props.statistics.newUsers?
                                        this.props.statistics.newUsers.usersLastMonth > this.props.statistics.newUsers.usersThisMonth ?
                                        <TrendingDown
                                            size={25}
                                            strokeWidth={2}
                                            color={'black'}
                                        /> 
                                        :
                                        <TrendingUp
                                            size={25}
                                            strokeWidth={2}
                                            color={'black'}
                                        />
                                    :"0"
                                }

                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-6 col-sm-6 col-12 no-gutters">
                        <div className="metric">
                             <Photo
                                size={48}
                                strokeWidth={2}
                                color={'black'}
                            />
                            <div className="content">
                                <p>New posts</p>
                                {this.props.statistics.totalOfNewPost?this.props.statistics.totalOfNewPost.postsThisMonth:"0"}
                            </div>
                             <div className="Difference">
                                {
                                    this.props.statistics.totalOfNewPost?
                                       this.props.statistics.totalOfNewPost.postsLastMonth
                                    :"0"
                                }
                                {
                                   this.props.statistics.totalOfNewPost?
                                        this.props.statistics.totalOfNewPost.postsLastMonth > this.props.statistics.totalOfNewPost.postsThisMonth ?
                                        <TrendingDown
                                            size={25}
                                            strokeWidth={2}
                                            color={'black'}
                                        /> 
                                        :
                                        <TrendingUp
                                            size={25}
                                            strokeWidth={2}
                                            color={'black'}
                                        />
                                    :"0"
                                }

                            </div>
                        </div>
                    </div>
                    <div className="col-xl-3 col-lg-6 col-sm-6 col-12 no-gutters">
                        <div className="metric">
                            <Users
                                size={48}
                                strokeWidth={2}
                                color={'black'}
                            />
                            <div className="content">
                                <p>Total Accounts</p>
                                {this.props.statistics.sumOfUsers?this.props.statistics.sumOfUsers.cnt:"0"}
                            </div>
                            <div className="Difference">
                                {
                                    this.props.statistics.sumOfUsers?
                                        this.props.statistics.sumOfUsers.usersLastYear
                                    :"0"
                                }
                                {
                                    this.props.statistics.sumOfUsers?
                                        this.props.statistics.sumOfUsers.usersLastYear > this.props.statistics.sumOfUsers.usersThisYear ?
                                        <TrendingDown
                                            size={25}
                                            strokeWidth={2}
                                            color={'black'}
                                        /> 
                                        :
                                        <TrendingUp
                                            size={25}
                                            strokeWidth={2}
                                            color={'black'}
                                        />
                                    :"0"
                                }

                            </div>
                        </div>    
                    </div>
                    <div className="col-xl-3 col-lg-6 col-sm-6 col-12 no-gutters">
                        <div className="metric">
                           <UserExclamation
                                size={48}
                                strokeWidth={2}
                                color={'black'}
                            />
                            <div className="content">
                                <p>Unused Account</p>
                                {this.props.statistics.unusedUsers?this.props.statistics.unusedUsers:"0"}
                            </div>
                            <div className="Difference hidden">
                                <TrendingDown
                                    size={25}
                                    strokeWidth={2}
                                    color={'black'}
                                /> 
                            </div>
                        </div>
                    </div>
                </div>
           </div>
            <div className="chart">
                <div className="wrapper">
                    <ResponsiveLine
                        data={this.state.growthOfUserData}
                        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                        xScale={{ type: 'point' }}
                        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false }}
                        yFormat=" >-.2r"
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            orient: 'bottom',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Growth of users',
                            legendOffset: 36,
                            legendPosition: 'middle'
                        }}
                        axisLeft={{
                            orient: 'left',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'count',
                            legendOffset: -40,
                            legendPosition: 'middle'
                        }}
                        pointSize={10}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: 'serieColor' }}
                        pointLabelYOffset={-12}
                        useMesh={true}
                        legends={[
                            {
                                anchor: 'bottom-right',
                                direction: 'column',
                                justify: false,
                                translateX: 100,
                                translateY: 0,
                                itemsSpacing: 0,
                                itemDirection: 'left-to-right',
                                itemWidth: 80,
                                itemHeight: 20,
                                itemOpacity: 0.75,
                                symbolSize: 12,
                                symbolShape: 'circle',
                                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemBackground: 'rgba(0, 0, 0, .03)',
                                            itemOpacity: 1
                                        }
                                    }
                                ]
                            }
                        ]}
                    />
                </div>
                <div className="wrapper">
                    <ResponsivePie
                    data={this.state.percentageOfAge}
                    margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
                    startAngle={-61}
                    innerRadius={0.5}
                    padAngle={2}
                    activeOuterRadiusOffset={8}
                    colors={{ scheme: 'purple_blue' }}
                    borderWidth={1}
                    borderColor={{ from: 'color', modifiers: [ [ 'darker', 0.2 ] ] }}
                    arcLinkLabelsSkipAngle={10}
                    arcLinkLabelsTextColor="#333333"
                    arcLinkLabelsThickness={2}
                    arcLinkLabelsColor={{ from: 'color' }}
                    arcLabelsSkipAngle={10}
                    arcLabelsTextColor={{ from: 'color', modifiers: [ [ 'darker', 2 ] ] }}
                    defs={[
                        {
                            id: 'dots',
                            type: 'patternDots',
                            background: 'inherit',
                            color: 'rgba(255, 255, 255, 0.3)',
                            size: 4,
                            padding: 1,
                            stagger: true
                        },
                        {
                            id: 'lines',
                            type: 'patternLines',
                            background: 'inherit',
                            color: 'rgba(255, 255, 255, 0.3)',
                            rotation: -45,
                            lineWidth: 6,
                            spacing: 10
                        }
                    ]}
                    fill={[
                        {
                            match: {
                                id: 'ruby'
                            },
                            id: 'dots'
                        },
                        {
                            match: {
                                id: 'c'
                            },
                            id: 'dots'
                        },
                        {
                            match: {
                                id: 'go'
                            },
                            id: 'dots'
                        },
                        {
                            match: {
                                id: 'python'
                            },
                            id: 'dots'
                        },
                        {
                            match: {
                                id: 'scala'
                            },
                            id: 'lines'
                        },
                        {
                            match: {
                                id: 'lisp'
                            },
                            id: 'lines'
                        },
                        {
                            match: {
                                id: 'elixir'
                            },
                            id: 'lines'
                        },
                        {
                            match: {
                                id: 'javascript'
                            },
                            id: 'lines'
                        }
                    ]}
                    legends={[
                        {
                            anchor: 'bottom',
                            direction: 'row',
                            justify: false,
                            translateX: 0,
                            translateY: 56,
                            itemsSpacing: 0,
                            itemWidth: 100,
                            itemHeight: 18,
                            itemTextColor: '#999',
                            itemDirection: 'left-to-right',
                            itemOpacity: 1,
                            symbolSize: 18,
                            symbolShape: 'circle',
                            effects: [
                                {
                                    on: 'hover',
                                    style: {
                                        itemTextColor: '#000'
                                    }
                                }
                            ]
                        }
                    ]}
                  /> 
                </div>
                <div className="wrapper">
                    <ResponsiveLine
                        data={this.state.userBehaviors}
                        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
                        xScale={{ type: 'point' }}
                        yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: true, reverse: false }}
                        yFormat=" >-.2r"
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                            orient: 'bottom',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'Growth of users',
                            legendOffset: 36,
                            legendPosition: 'middle'
                        }}
                        axisLeft={{
                            orient: 'left',
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: 'count',
                            legendOffset: -40,
                            legendPosition: 'middle'
                        }}
                        pointSize={10}
                        pointColor={{ theme: 'background' }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: 'serieColor' }}
                        pointLabelYOffset={-12}
                        useMesh={true}
                        legends={[
                            {
                                anchor: 'bottom-right',
                                direction: 'column',
                                justify: false,
                                translateX: 100,
                                translateY: 0,
                                itemsSpacing: 0,
                                itemDirection: 'left-to-right',
                                itemWidth: 80,
                                itemHeight: 20,
                                itemOpacity: 0.75,
                                symbolSize: 12,
                                symbolShape: 'circle',
                                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                                effects: [
                                    {
                                        on: 'hover',
                                        style: {
                                            itemBackground: 'rgba(0, 0, 0, .03)',
                                            itemOpacity: 1
                                        }
                                    }
                                ]
                            }
                        ]}
                    />         
                </div>
            </div>
            <div className="top-ten-uesrs">
                <div className="row no-gutters">
                    <div className="col-xl-4 col-lg-4 col-sm-12 col-12 no-gutters">
                        <ul className="user-list">
                            {
                                this.props.statistics.top10Users?
                                    this.props.statistics.top10Users.map((item,i) => {
                                        return <li className="user-item">
                                            <img src={item.avt}/>
                                            <div className="user-info">
                                                <p>{item.userName}</p>
                                                <p>{item.length} followers</p>
                                            </div>
                                            <div className="user-award">
                                            {
                                                i==0?
                                                    <Award
                                                        size={38}
                                                        strokeWidth={2}
                                                        color={'rgb(250, 227, 25)'}
                                                    />
                                                :i==1?
                                                        <Award
                                                            size={38}
                                                            strokeWidth={2}
                                                            color={'rgb(236, 114, 0)'}
                                                        />
                                                :i==2?
                                                    <Award
                                                        size={38}
                                                        strokeWidth={2}
                                                        color={' rgb(6, 211, 23)'}
                                                    />
                                                :""
                                            }
                                            </div>
                                        </li>
                                    })
                                :""
                            }
                        </ul>
                    </div>
                    <div className="col-xl-8 col-lg-8 col-sm-12 col-12 no-gutters"> 
                        <div className="wrapper">
                            <ResponsiveChoropleth
                                data={this.state.nationality}
                                features={countries.features}
                                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                                colors="nivo"
                                domain={[ 0, 1000000 ]}
                                unknownColor="#666666"
                                label="properties.name"
                                valueFormat=".2s"
                                projectionTranslation={[ 0.5, 0.5 ]}
                                projectionRotation={[ 0, 0, 0 ]}
                                enableGraticule={true}
                                graticuleLineColor="#dddddd"
                                borderWidth={0.5}
                                borderColor="#152538"
                                legends={[
                                    {
                                        anchor: 'bottom-left',
                                        direction: 'column',
                                        justify: true,
                                        translateX: 20,
                                        translateY: -100,
                                        itemsSpacing: 0,
                                        itemWidth: 94,
                                        itemHeight: 18,
                                        itemDirection: 'left-to-right',
                                        itemTextColor: '#444444',
                                        itemOpacity: 0.85,
                                        symbolSize: 18,
                                        effects: [
                                            {
                                                on: 'hover',
                                                style: {
                                                    itemTextColor: '#000000',
                                                    itemOpacity: 1
                                                }
                                            }
                                        ]
                                    }
                                ]}
                            />
                        </div>     
                    </div>
                </div>
            </div>
        </Layout>
        );
    }
}

function mapStateToProps(state) {
    return {
        user: state.user,
        statistics: state.statistics
    };
}

export default connect(mapStateToProps)(withRouter(Home));
