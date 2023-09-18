const appDataSource = require('./dataSource');

const getProductDetailById = async (productId) => {
  const query = `
    SELECT
      p.id, p.name, p.description AS productDescription,
      p.price, p.available_ticket AS availableTicket,
      p.film_rating AS filmRating, p.place AS performPlace,
      p.important_notice AS importantNotice, p.discount_information AS discountInformation,
      ti.thumbnail_image_url AS thumbnailImageUrl,
      cg.genre_name AS genreName,
      po.id AS productOptionsId,
      po.sequence, po.start_date AS startDate, po.start_time AS startTime,
      po.running_time AS runningTime,
      AVG(r.rating) AS averageRating,
      (
        SELECT 
          JSON_ARRAYAGG(
            JSON_OBJECT(
              'performerName', subquery.performer_name, 
              'performerDescription', subquery.performer_description, 
              'actorImageUrl', subquery.actor_image_url
            )
          )
        FROM (
          SELECT 
            ps.performer_name, 
            ps.performer_description,
            ai.actor_image_url,
            ROW_NUMBER() OVER (ORDER BY ps.id) AS row_num
          FROM performers ps
          LEFT JOIN actor_images ai ON ps.id = ai.performer_id
          WHERE ps.product_option_id = po.id
        ) subquery
        WHERE subquery.row_num <= 5
      ) AS performersInfo
    FROM
      products p
    LEFT JOIN
      product_options po ON p.id = po.product_id
    LEFT JOIN
      thumbnail_images ti ON p.id = ti.product_id
    LEFT JOIN
      product_category pc ON p.id = pc.product_id 
    LEFT JOIN
      category_genres cg ON pc.category_genres_id = cg.id
    LEFT JOIN
      reviews r ON po.id = r.product_option_id
    WHERE p.id = ?
    GROUP BY
      p.id, p.name, p.description, p.price, p.available_ticket,
      p.film_rating, p.place, ti.thumbnail_image_url,
      cg.genre_name, po.id, po.sequence, po.start_date,
      po.start_time, po.running_time
  `;
  const allDetails = await appDataSource.query(query, [productId]);

  const reviewQuery = `
    SELECT 
      r.user_id AS userId,
      DATE_FORMAT(r.created_at, '%y/%m/%d') AS writtenDate,
      r.title,
      u.nickname,
      r.content AS content,
      r.rating
    FROM 
      reviews r
    LEFT JOIN
      users u ON r.user_id = u.id
    WHERE r.product_option_id = ?;
  `;
  const allReviews = await appDataSource.query(reviewQuery, [productId]);

  const all = {
    allDetails,
    allReviews,
  };

  return all;
};

module.exports = { getProductDetailById };