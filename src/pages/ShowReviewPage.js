import {useEffect, useState} from "react";
import { getReviews } from "../api/FirebaseApi";
import { useLocation } from "react-router-dom";
import Rating from "@mui/material/Rating";
import { styled } from "@mui/material/styles";


export const ShowReviewPage = () => {
    const location = useLocation();
    const { show } = location.state;
    const [reviewList, setReviewList] = useState([]);

    const CustomRating = styled(Rating)({
        "& .MuiRating-iconFilled": {
          color: "#527b90;",
        },
        "& .MuiRating-iconHover": {
          color: "#6d9fb8;",
        },
        "& .MuiRating-iconEmpty": {
          color: "white",
        },
      });

    useEffect(() => {
        const fetchReviews = async () => {
          try {
            const curList = await getReviews("", show.id, false);
            setReviewList(curList); // Save the fetched reviews to state
          } catch (error) {
            console.log(error.message);
          }
        };
      
        fetchReviews();
      }, [show.id]);


    return(<>
        {reviewList.length > 0 ? (
            <div>
                {reviewList.map((item, index) => (
                    <div key={index}>
                    <div className="review-container">
                      <div>
                        <p style={{ fontSize: "24px", fontWeight: "bold" }}>
                          {item.username}
                        </p>
                      </div>
                      <p style={{ width: "200px" }}>"{item.comment}"</p>
                      <div>
                        <CustomRating
                          precision={0.5}
                          readOnly
                          value={item.rating}
                        />
                        <p>{item.rating}/5</p>
                      </div>
                    </div>
                    </div>
                ))}
            </div>
        ) : (<><p>No Reviews for this show</p></>)}
    </>)

}