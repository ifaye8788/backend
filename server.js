const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const productsFilePath = path.join(__dirname, 'products.json');

// Middleware pour lire les produits depuis le fichier
const readProductsFile = (callback) => {
  fs.readFile(productsFilePath, 'utf-8', (err, data) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, JSON.parse(data));
    }
  });
};

// Middleware pour écrire les produits dans le fichier
const writeProductsFile = (products, callback) => {
  fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), 'utf-8', (err) => {
    callback(err);
  });
};

// Récupérer tous les produits
app.get('/products', (req, res) => {
  readProductsFile((err, products) => {
    if (err) {
      res.status(500).send('Unable to read products data.');
      return;
    }
    res.send(products);
  });
});

// Créer un nouveau produit
app.post('/products', (req, res) => {
  readProductsFile((err, products) => {
    if (err) {
      res.status(500).send('Unable to read products data.');
      return;
    }
    const newProduct = { id: products.length + 1, ...req.body };
    products.push(newProduct);
    writeProductsFile(products, (err) => {
      if (err) {
        res.status(500).send('Unable to save product data.');
        return;
      }
      res.status(201).send(newProduct);
    });
  });
});

// Mettre à jour un produit existant
app.patch('/products/:id', (req, res) => {
  readProductsFile((err, products) => {
    if (err) {
      res.status(500).send('Unable to read products data.');
      return;
    }
    const productIndex = products.findIndex(p => p.id === parseInt(req.params.id, 10));
    if (productIndex === -1) {
      res.status(404).send('Product not found.');
      return;
    }
    const updatedProduct = { ...products[productIndex], ...req.body };
    products[productIndex] = updatedProduct;
    writeProductsFile(products, (err) => {
      if (err) {
        res.status(500).send('Unable to save product data.');
        return;
      }
      res.send(updatedProduct);
    });
  });
});

// Supprimer un produit
app.delete('/products/:id', (req, res) => {
  readProductsFile((err, products) => {
    if (err) {
      res.status(500).send('Unable to read products data.');
      return;
    }
    products = products.filter(p => p.id !== parseInt(req.params.id, 10));
    writeProductsFile(products, (err) => {
      if (err) {
        res.status(500).send('Unable to save product data.');
        return;
      }
      res.status(204).send();
    });
  });
});

// Lancer le serveur
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
