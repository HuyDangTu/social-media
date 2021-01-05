import React from 'react';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Skeleton from '@material-ui/lab/Skeleton';
function LoadingCard(props) {
  return (
    <Card>
      <CardHeader
        avatar={<Skeleton animation="wave" variant="circle" width={40} height={40} />}
      
        title={<Skeleton animation="wave" height={10} width="80%" style={{ marginBottom: 6 }} />}
        subheader={<Skeleton animation="wave" height={10} width="40%" />}
      />
          {<Skeleton animation="wave" variant="rect" height="400px"  />}
      <CardContent>
        {
          <React.Fragment>
            <Skeleton animation="wave" height={10} style={{ marginBottom: 6 }} />
            <Skeleton animation="wave" height={10} width="80%" />
          </React.Fragment>
        }
      </CardContent>
    </Card>
  );
}

export default LoadingCard;
