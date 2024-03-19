using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class GridManager : MonoBehaviour
{
    [SerializeField] private int rows = 5;
    [SerializeField] private int cols = 8;
    [SerializeField] private float tileSize = 1;
    [SerializeField] private GameObject tileInstance;

    void Start()
    {
        GenerateGrid();
    }

    void Update()
    {

    }

    private void GenerateGrid() {
        GameObject refTile = (GameObject)Instantiate(tileInstance);
        for (int row = 0; row < rows; row++) {
            for (int col = 0; col < cols; col++) {
                GameObject tile = (GameObject)Instantiate(refTile, transform);
                float posX = col * tileSize;
                float posY = row * -tileSize;

                tile.transform.position = new Vector2(posX, posY);
                tile.transform.localScale = new Vector2(tileSize, tileSize);

            }
        }
        Destroy(refTile);

        float gridW = cols * tileSize;
        float gridH = rows * tileSize;
        transform.position = new Vector2(-gridW / 2 + tileSize / 2, gridH / 2 - tileSize / 2);
    }
}
