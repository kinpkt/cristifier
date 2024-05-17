"use client";

import { Container, InputGroup, Form, Button, Alert, Table, Spinner } from 'react-bootstrap';
import { useState } from 'react';
import generatePDF, { Margin, Resolution } from 'react-to-pdf';
import useSWR from 'swr';

export default function RegTable()
{
    const [comp, setComp] = useState('');
    const [sortedData, setSortedData] = useState([]);
    const [hideCompAlert, setHideCompAlert] = useState(true);
    const [finishSort, setFinishSort] = useState(false);

    const PDFoptions = {
        filename: `${comp}_registration_paper.pdf`,
        method: 'open',
        page: {
            margin: Margin.MEDIUM
        }
    }

    const fetcher = async () => {
        const response = await fetch(`https://www.worldcubeassociation.org/api/v0/competitions/${comp}/wcif/public`);
        const data = await response.json();
        return data;
    }

    const { data, mutate, error } = useSWR('regtable', fetcher);

    function handleCompChange(e)
    {
        setComp(e.target.value);
    }

    function fetchWCIF()
    {
        mutate()

        if (comp === '' || error)
        {
            return setHideCompAlert(false);
        }
        else
        {
            generateTable(data);
        }
    }

    function generateTable(data)
    {
        let competitors = data.persons;
        let newcomers = [];

        competitors = competitors.filter(function(cpt) 
        {
            if (cpt.wcaId === null)
            {
                newcomers.push(cpt);
                return false;
            }
            return !(cpt.registrantId === null || cpt.wcaId === null);
        });
        
        console.log(newcomers);
        
        competitors.sort(function(a, b)
        {
            let nameA = a.name.toUpperCase();
            let nameB = b.name.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        })

        setSortedData(competitors);
        setFinishSort(true);
        alert('Fetched successfully!');
    }

    const regionNames = new Intl.DisplayNames(['en'], {type: 'region'});

    const renderNameList = sortedData.map((cpt, i) =>
    {
        let currentLetter = '';
        
        if (i < sortedData.length - 1)
        {
            if (i === 0)
            {
                currentLetter = sortedData[i + 1].name[0];
                return (
                    <>
                        <tr className='table-secondary' key={currentLetter}>
                            <th colSpan={7}>{currentLetter}</th>
                        </tr>
                        <tr key={cpt.wcaUserId}>
                            <td>{cpt.registrantId}</td>
                            <td>{cpt.wcaId}</td>
                            <td>{cpt.name}</td>
                            <td>{cpt.gender === 'm' ? 'Male' : cpt.gender === 'f' ? 'Female' : 'Other'}</td>
                            <td>{regionNames.of(cpt.countryIso2)}</td>
                            <td></td>
                            <td></td>
                        </tr>
                    </>
                )
            }
            else if (cpt.name[0] !== sortedData[i + 1].name[0])
            {
                currentLetter = sortedData[i + 1].name[0];
                return (
                    <>
                        <tr key={cpt.wcaUserId}>
                            <td>{cpt.registrantId}</td>
                            <td>{cpt.wcaId}</td>
                            <td>{cpt.name}</td>
                            <td>{cpt.gender === 'm' ? 'Male' : cpt.gender === 'f' ? 'Female' : 'Other'}</td>
                            <td>{regionNames.of(cpt.countryIso2)}</td>
                            <td></td>
                            <td></td>
                        </tr>
                        <tr className='table-secondary' key={currentLetter}>
                            <th colSpan={7}>{currentLetter}</th>
                        </tr>
                    </>
                )
            }
        }

        return (
            <tr key={cpt.wcaUserId}>
                <td>{cpt.registrantId}</td>
                <td>{cpt.wcaId}</td>
                <td>{cpt.name}</td>
                <td>{cpt.gender === 'm' ? 'Male' : cpt.gender === 'f' ? 'Female' : 'Other'}</td>
                <td>{regionNames.of(cpt.countryIso2)}</td>
                <td></td>
                <td></td>
            </tr>
        );
    });

    const targetElement = () => document.getElementById('pdf-table');

    return (
        <>
            <h1 className='text-center'>Registration Table PDF Generator</h1>
            <Container className='w-75 mt-3 bg-dark py-5 rounded-4' variant='dark'>
                <Alert variant='warning' onClose={() => setHideCompAlert(false)} dismissible hidden={hideCompAlert}>
                    Error : Loading issue, please try fetching again.
                </Alert>
                <InputGroup className='mb-3'>
                    <InputGroup.Text id='compname'>Competition ID</InputGroup.Text>
                    <Form.Control
                        placeholder='Competition ID (For WCIF Fetching)'
                        aria-label='Competition ID (For WCIF Fetching)'
                        aria-describedby='compname'
                        onChange={handleCompChange}
                    />
                    <Button type='submit' variant='success' onClick={fetchWCIF}>Fetch WCIF</Button>
                </InputGroup>
                <Button type='submit' variant='primary' onClick={() => generatePDF(targetElement, PDFoptions)}>Download PDF</Button>
                &emsp;<Button type='submit' variant='danger'>Download PDF (First-timers; WIP)</Button>
            </Container><br/>
            <Table id='pdf-table' striped bordered size='lg'>
                <thead>
                    <tr className='text-center table-dark'>
                        <th>ID</th>
                        <th>WCA ID</th>
                        <th className='w-auto'>Name</th>
                        <th>Gender</th>
                        <th>Country</th>
                        <th className='w-25'>Sign</th>
                        <th>Remark</th>
                    </tr>
                </thead>
                <tbody>
                { 
                    finishSort ? renderNameList :
                    <tr className='text-center'><td colSpan={8}>Waiting for data...</td></tr>
                }
                </tbody>
            </Table>
        </>
    );
}