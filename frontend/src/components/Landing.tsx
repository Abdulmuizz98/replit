/** Import necessary libraries */
import axios from "axios";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styled from "@emotion/styled";

const INIT_URL = import.meta.env.VITE_APP_INIT_URL as string;

/** Styled components */
const Container = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  color: white;
`;

const StyledInput = styled.input`
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const StyledSelect = styled.select`
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const StyledButton = styled.button`
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #0056b3;
  }
`;

const StyledList = styled.ul`
  list-style: none;
  padding: 0;
`;

const StyledListItem = styled.li`
  margin: 10px 0;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  display: flex;
  justify-content: space-between;
`;

interface Repl {
  _id: string;
  name: string;
  userId: string;
  status: string | undefined;
}

/** Component */
export const Landing = () => {
  let { userId } = useParams();

  if (!userId || !userId.startsWith("@")) {
    return <div>Invalid userId</div>;
  }
  userId = userId.slice(1).toLowerCase();

  const [language, setLanguage] = useState("node-js");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [repls, setRepls] = useState<Repl[]>([]);

  console.log(userId);
  console.log(repls);
  useEffect(() => {
    async function fetchRepls() {
      const res = await axios.get(`${INIT_URL}/repls/${userId}`);
      setRepls(res.data);
    }

    fetchRepls();
  }, []);

  async function handleClick() {
    setLoading(true);
    try {
      const res = await axios.post(`${INIT_URL}/project`, {
        userId,
        name,
        language,
      });

      if (res.status !== 200) {
        setLoading(false);
        alert(res.data.message);
      }

      const repl = res.data as Repl;
      setLoading(false);
      setRepls([...repls, repl]);
      navigate(`/coding/@${userId}?replId=${repl._id}`);
    } catch (err: any) {
      setLoading(false);
      alert(err.response.data.message);
    }
  }

  return (
    <Container>
      <Title>Replx</Title>
      <StyledInput
        onChange={(e) => setName(e.target.value)}
        type="text"
        placeholder="Repl Name"
        value={name}
      />
      <StyledSelect
        name="language"
        id="language"
        onChange={(e) => setLanguage(e.target.value)}
      >
        <option value="node-js">Node.js</option>
        <option value="python">Python</option>
      </StyledSelect>
      <StyledButton disabled={loading} onClick={handleClick}>
        {loading ? "Starting ..." : "Start Coding"}
      </StyledButton>

      <StyledList>
        {repls.map((repl) => (
          <StyledListItem key={repl._id}>
            <Link to={`/coding/@${userId}?replId=${repl._id}`}>
              <div>{repl.name}</div>
            </Link>
          </StyledListItem>
        ))}
      </StyledList>
    </Container>
  );
};
