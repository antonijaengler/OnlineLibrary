--SELECT title, author, yearofpublication, publisher, imageurls
--FROM ratings
--JOIN books ON ratings.isbn = books.isbn
--WHERE rating = 5
--LIMIT 10;

--SELECT COUNT(*) as 'count' FROM books

--INSERT INTO users (username, password, location, age, email)
                --VALUES ('antonija', '11111111', 'Zagreb, Hrvatska', 22, 'anto@nija')

--SELECT * 
--FROM users
--WHERE username = 'johndoe1' --userid: 278867

--INSERT INTO ratings (userid, isbn, rating)
--VALUES (278867, '0002005018', 4),
--(278867, '0060168013', 3),
--(278867, '0553582909', 5),
--(278867, '0060914068', 1)

--UPDATE users
--SET username = 'zeljko',
    --password = 'zeljko277',
    --email = 'zeljko@gmail'
--WHERE userid = 277427


--SELECT title, author, yearofpublication, publisher, imageurls, rating
                    --FROM books
                    --JOIN ratings ON ratings.isbn = books.isbn
                    --WHERE userid = '277427'

--SELECT * FROM ratings WHERE isbn = '0002005018' and userid = 278867

--SELECT * FROM books JOIN ratings ON books.isbn = ratings.isbn WHERE userid = 277427 ORDER BY title

--SELECT AVG(rating) as avgrating, books.isbn
--FROM ratings
--JOIN books ON ratings.isbn = books.isbn
--GROUP BY books.isbn
--ORDER BY avgrating DESC
--LIMIT 10

--SELECT * FROM ratings WHERE isbn = '0698114078'

--SELECT * FROM books WHERE isbn = '1234567891'

--SELECT username, role
--FROM users 
--WHERE userid = 278868

--SELECT * FROM books where title = 'Titanic'; -- and ratings!

DELETE FROM books where isbn = '1234567893';