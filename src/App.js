import { useRef, useEffect, useState } from 'react';

import GeoAsset from './contracts/GeoAsset.json'
import Web3 from 'web3';

import ArcGISMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

import './App.css';

function App() {
  const mapRef = useRef();
  const [web3State, setWeb3State] = useState({});

  const loadWeb3 = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install metamask');
      return;
    }

    window.ethereum.enable();
    const web3 = new Web3(window.ethereum);
    const accounts = await web3.eth.getAccounts();
    const account = accounts[0];
    const contract = new web3.eth.Contract(GeoAsset.abi);
    console.log('contract', contract)
    if (account) {
      setWeb3State({
        account,
        contract,
        web3
      });
    }
  }

  const loadMap = async (container) => {
    const layer = new FeatureLayer({
      url:
        "https://services.arcgis.com/V6ZHFr6zdgNZuVG0/ArcGIS/rest/services/IncidentsReport/FeatureServer/0",
      outFields: ["*"],
      popupEnabled: false,
      id: "incidentsLayer"
    });

    const map = new ArcGISMap({
      basemap: "dark-gray-vector",
      layers: [layer]
    });

    const view = new MapView({
      container,
      map,
      zoom: 12,
      center: [-117.18, 34.06]
    });

    const { contract, account, web3 } = web3State;
    console.log('state contract', contract);

    view.when(async () => {
      view.on("click", async ({ mapPoint }) => {
        const lat = mapPoint.latitude;
        const lon = mapPoint.longitude;

        let contractAddress;

        await contract.deploy({
          data: GeoAsset.bytecode,
          arguments: [lat.toString(), lon.toString()]
        }).send({
          from: account
        }).once('receipt', async (receipt) => {
          // save address for later
          contractAddress = receipt.contractAddress;
        });

        // create contract
        const geoAsset = new web3.eth.Contract(GeoAsset.abi, contractAddress);

        const { addFeatureResults } = await layer.applyEdits({
          addFeatures: [{
            attributes: {
              IncidentType: 3,
              IncidentDescription: contractAddress
            },
            geometry: {
              type: "point",
              latitude: lat,
              longitude: lon
            }
          }]
        });

        const { globalId } = addFeatureResults[0];
        await geoAsset.methods.update(globalId).send({
          from: account
        });

        const latitude = await geoAsset.methods.lat().call();
        const longitude = await geoAsset.methods.lon().call();

        console.log('lat/lon', latitude, longitude);

      })
    });
  }

  useEffect(() => {
    if (mapRef.current) {
      loadWeb3();
    }
  }, []);

  useEffect(() => {
    loadMap(mapRef.current);
  }, [web3State]);

  return (
    <div className='viewDiv' ref={mapRef}>
    </div>
  );
}

export default App;
