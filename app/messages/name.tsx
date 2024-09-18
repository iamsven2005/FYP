import { useEffect, useState } from "react";
import axios from "axios";

interface Props {
  id: string;
}

const Name = ({ id }: Props) => {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const fetchName = async () => {
      try {
        const response = await axios.get(`/api/items/${id}/name`); // Ensure the route matches
        setUsername(response.data.username);
      } catch (error) {
        console.error("Failed to fetch user name:", error);
        setUsername("Unknown");
      }
    };

    fetchName();
  }, [id]);

  return <p className="text-sm text-gray-500">{username || "Loading..."}</p>;
};

export default Name;
