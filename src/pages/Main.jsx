import {
  Box,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Button,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState, Fragment } from "react";
import * as api from "strateegia-api";
import Loading from "../components/Loading";
import MapList from "../components/MapList";
import ProjectList from "../components/ProjectList";
import { extractUserCommentInfo } from "../data/graphData";
import * as d3 from "d3";
import { exportTableAsCsv, exportJson } from "../utils/exportFunctions";
import { mean, stdev, median, mode, variance } from "stats-lite";

export default function Main() {
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedMap, setSelectedMap] = useState("");
  const [selectedDivPoint, setSelectedDivPoint] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [commentsReport, setCommentsReport] = useState(null);
  const [rawData, setRawData] = useState(null);

  const handleSelectChange = (e) => {
    setSelectedProject(e.target.value);
  };

  const handleMapSelectChange = (e) => {
    setSelectedMap(e.target.value);
  };

  const handleDivPointSelectChange = (e) => {
    setSelectedDivPoint(e.target.value);
  };

  useEffect(() => {
    setCommentsReport(null);
    setSelectedMap("");
    setSelectedDivPoint("");
  }, [selectedProject]);

  useEffect(() => {
    setSelectedDivPoint("");
    async function fetchData() {
      setIsLoading(true);
      try {
        // const response = await api.getMapById(accessToken, selectedMap);
        // const divPointsRequest = [];
        // response?.points
        //   ?.filter((point) => point.point_type === "DIVERGENCE")
        //   .forEach((divPoint) => {
        //     console.log(divPoint.title);
        //     divPointsRequest.push(
        //       api
        //         .getDivergencePointById(accessToken, divPoint.id)
        //         .then((divPointRes) => {
        //           return api
        //             .getCommentsGroupedByQuestionReport(
        //               accessToken,
        //               divPoint.id
        //             )
        //             .then((res) => {
        //               return {
        //                 divPoint: divPointRes,
        //                 commentsByQuestion: res,
        //               };
        //             });
        //         })
        //     );
        //   });
        // const divPointsResponse = await Promise.all(divPointsRequest);
        // console.log("divPoints %o", divPointsResponse);
        // setCommentsReport([...divPointsResponse]);
        // console.log("mapDetails: %o", response);
        // [TODO] - use the access token to fetch the data
        // [TODO] - add the fetch data function here
        const response2 = await extractUserCommentInfo(
          accessToken,
          selectedProject
        );
        setCommentsReport({ ...response2 });
        setRawData([...response2.raw.sort((a, b) => sortString(a, b))]);
      } catch (error) {
        console.log(error);
      }
      setIsLoading(false);
    }
    fetchData();
  }, [selectedProject]);

  function calculateAverage(item) {
    const items = commentsReport?.counter.map((d) => d[item] || 0);
    console.log("items %o", items);
    return items
      .reduce((avg, value, _, { length }) => {
        return avg + value / length;
      }, 0)
      .toFixed(2);
  }

  function calculateMean(item) {
    const items = commentsReport?.counter.map((d) => d[item] || 0);
    return mean(items).toFixed(3);
  }

  function calculateStDev(item) {
    const items = commentsReport?.counter.map((d) => d[item] || 0);
    return stdev(items).toFixed(3);
  }

  function calculateMedian(item) {
    const items = commentsReport?.counter.map((d) => d[item] || 0);
    return median(items).toFixed(3);
  }

  function calculateMode(item) {
    const items = commentsReport?.counter.map((d) => d[item] || 0);
    return mode(items).toFixed(3);
  }

  function calculateVariance(item) {
    const items = commentsReport?.counter.map((d) => d[item] || 0);
    return variance(items).toFixed(3);
  }

  useEffect(() => {
    setAccessToken(localStorage.getItem("accessToken"));
  }, []);

  return (
    <Box padding={10}>
      <Heading as="h3" size="md" mb={3}>
        relatório de comentários
      </Heading>
      <ProjectList handleSelectChange={handleSelectChange} />
      {/* <MapList
        projectId={selectedProject}
        handleSelectChange={handleMapSelectChange}
      /> */}
      {/* <DivPointList
        mapId={selectedMap}
        handleSelectChange={handleDivPointSelectChange}
      /> */}
      <Loading active={isLoading} />

      {/* [TODO] Add you component here */}
      {commentsReport && (
        <Fragment>
          <Flex mt={2} justify={"end"}>
            <Button
              size="xs"
              fontSize="14px"
              fontWeight="400"
              bg="#6c757d"
              color="#fff"
              borderRadius="3px"
              _hover={{
                bg: "#5C636A",
              }}
              paddingBottom={"4px"}
              onClick={() => {
                exportTableAsCsv("table_output", ",");
              }}
            >
              csv
            </Button>
            <Button
              size="xs"
              fontSize="14px"
              fontWeight="400"
              bg="#6c757d"
              color="#fff"
              borderRadius="3px"
              _hover={{
                bg: "#5C636A",
              }}
              paddingBottom={"4px"}
              marginStart={1}
              onClick={() => {
                exportJson(rawData);
              }}
            >
              json
            </Button>
          </Flex>
          <TableContainer mt={3}>
            <Table id={"table_output"} variant={"striped"} size={"sm"}>
              <Thead>
                <Tr>
                  <Th>Estatística</Th>
                  <Th>respostas às questões</Th>
                  <Th>comentários às respostas</Th>
                  <Th>concordâncias</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr key="mean">
                  <Td>
                    <b>média</b>
                  </Td>
                  <Td>
                    <b>{calculateMean("comments")}</b>
                  </Td>
                  <Td>
                    <b>{calculateMean("replies")}</b>
                  </Td>
                  <Td>
                    <b>{calculateMean("agreements")}</b>
                  </Td>
                </Tr>
                <Tr key="median">
                  <Td>
                    <b>mediana</b>
                  </Td>
                  <Td>
                    <b>{calculateMedian("comments")}</b>
                  </Td>
                  <Td>
                    <b>{calculateMedian("replies")}</b>
                  </Td>
                  <Td>
                    <b>{calculateMedian("agreements")}</b>
                  </Td>
                </Tr>
                <Tr key="mode">
                  <Td>
                    <b>moda</b>
                  </Td>
                  <Td>
                    <b>{calculateMode("comments")}</b>
                  </Td>
                  <Td>
                    <b>{calculateMode("replies")}</b>
                  </Td>
                  <Td>
                    <b>{calculateMode("agreements")}</b>
                  </Td>
                </Tr>
                <Tr key="stddev">
                  <Td>
                    <b>desvio padrão</b>
                  </Td>
                  <Td>
                    <b>{calculateStDev("comments")}</b>
                  </Td>
                  <Td>
                    <b>{calculateStDev("replies")}</b>
                  </Td>
                  <Td>
                    <b>{calculateStDev("agreements")}</b>
                  </Td>
                </Tr>
                <Tr key="variance">
                  <Td>
                    <b>variância</b>
                  </Td>
                  <Td>
                    <b>{calculateVariance("comments")}</b>
                  </Td>
                  <Td>
                    <b>{calculateVariance("replies")}</b>
                  </Td>
                  <Td>
                    <b>{calculateVariance("agreements")}</b>
                  </Td>
                </Tr>
              </Tbody>
              <br></br>
              <Thead>
                <Tr>
                  <Th>usuário</Th>
                  <Th>respostas às questões</Th>
                  <Th>comentários às respostas</Th>
                  <Th>concordâncias</Th>
                </Tr>
              </Thead>
              <Tbody>
                {commentsReport?.counter
                  .sort((a, b) => sortString(a.user, b.user))
                  .map((comment) => {
                    return (
                      <Tr key={comment.user}>
                        <Td>{comment.user}</Td>
                        <Td>{comment.comments || 0}</Td>
                        <Td>{comment.replies || 0}</Td>
                        <Td>{comment.agreements || 0}</Td>
                      </Tr>
                    );
                  })}
              </Tbody>
            </Table>
          </TableContainer>
          {/* <Heading as={"h3"} size={"md"} mt={3}>
            dados brutos
          </Heading>
          <pre>{JSON.stringify(rawData, null, 2)}</pre> */}
        </Fragment>
      )}
    </Box>
  );
}

function sortString(a, b) {
  const nameA = a.toUpperCase(); // ignore upper and lowercase
  const nameB = b.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
}
