using UnityEngine;
using System.Collections;
using TMPro;

public class PlayerController : MonoBehaviour
{
    [SerializeField] float moveSpeed = 2.25f;
    [SerializeField] Transform leftFirePoint;
    [SerializeField] Transform rightFirePoint;
    [SerializeField] float projectileSpeed = 2f;
    [SerializeField] GameObject position;
    [SerializeField] GameObject UI;
    private int[] shopLevels = new int[] { 1, 1, 1, 1, 1, 1, 1 };
    private Rigidbody2D rb;
    private GameObject playerSprite;
    public float coins = 0f;
    private bool canFire = true;
    [SerializeField] private bool autoFire = false;
    private TextMeshProUGUI coinsText;

    private float viewDistance;
    private float rotationSpeed = 120f; // deg / second
    private float cannonRange = 0.75f;
    [SerializeField] float fireCooldown = 0.75f;


    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
        GameObject coinsCanvas = GameObject.Find("Coins");
        coinsText = coinsCanvas.GetComponentInChildren<TextMeshProUGUI>();

        playerSprite = GameObject.Find("Sprite");
    }

    void Update()
    {
        RotatePlayer();

        UpdateMinimap();

        if ((canFire && Input.GetMouseButtonDown(0)) || autoFire && canFire)
        {
            FireProjectiles();
            StartCoroutine(CooldownTimer());
        }

        if(Input.GetKeyDown(KeyCode.E)) {
            autoFire = !autoFire;
        }

        if(Input.GetKeyDown(KeyCode.C)) {
            IncreaseCoins(100);
        }

        for (int i = 0; i < shopLevels.Length; i++)
        {
            if (Input.GetKeyDown(KeyCode.Alpha1 + i) && shopLevels[i] < 10)
            {
                if(coins >= ((shopLevels[i]) * 10)) {
                    coins -= (shopLevels[i]) * 10;
                    UpdateCoins(coins);
                    shopLevels[i]++;
                    ShopController.instance.UpdateShopItem(i + 1, shopLevels[i]);
                    UpdateUpgrades();
                }
                else {
                    print("not enough coins");
                }
            }
        }
    }

    void UpdateUpgrades() {
        cannonRange = 0.75f + ((shopLevels[2] + 1) * 0.15f);
        fireCooldown = 0.75f - ((shopLevels[4] + 1) * 0.05f);
        rotationSpeed = 120f + ((shopLevels[5] + 1) * 5f);
        viewDistance = 5f + ((shopLevels[6] + 1) * 0.25f);

        Camera.main.orthographicSize = viewDistance;
    }

    void FixedUpdate()
    {
        MovePlayer();
    }

    void RotatePlayer()
    {
        float rotationAmount = 0f;

        if (Input.GetKey(KeyCode.A))
        {
            rotationAmount += rotationSpeed * Time.deltaTime;
        }
        if (Input.GetKey(KeyCode.D))
        {
            rotationAmount -= rotationSpeed * Time.deltaTime;
        }
        playerSprite.transform.Rotate(Vector3.forward, rotationAmount);
    }


    void MovePlayer()
    {
        Vector2 movementDirection = playerSprite.transform.right;

        Vector2 intendedPosition = rb.position + movementDirection * moveSpeed * Time.fixedDeltaTime;

        intendedPosition.x = Mathf.Clamp(intendedPosition.x, -50f, 50f);
        intendedPosition.y = Mathf.Clamp(intendedPosition.y, -50f, 50f);

        Vector2 actualMovement = intendedPosition - rb.position;

        rb.velocity = actualMovement / Time.fixedDeltaTime;
    }



    void FireProjectiles()
    {
        GameObject leftProjectile = Instantiate(Settings.instance.projectilePrefab, leftFirePoint.position, Quaternion.identity, Settings.instance.projectileContainer);
        Rigidbody2D leftRigidbody = leftProjectile.GetComponent<Rigidbody2D>();
        leftRigidbody.velocity = leftFirePoint.up * projectileSpeed;

        GameObject rightProjectile = Instantiate(Settings.instance.projectilePrefab, rightFirePoint.position, Quaternion.identity, Settings.instance.projectileContainer);
        Rigidbody2D rightRigidbody = rightProjectile.GetComponent<Rigidbody2D>();
        rightRigidbody.velocity = -rightFirePoint.up * projectileSpeed;

        Destroy(leftProjectile, cannonRange);
        Destroy(rightProjectile, cannonRange);
    }

    IEnumerator CooldownTimer()
    {
        canFire = false;  
        yield return new WaitForSeconds(fireCooldown); 
        canFire = true;
    }

    void UpdateMinimap() {
        if (rb != null && position != null) {
            float x = (rb.position.x + 50f) / 50 - 1;
            float y = (rb.position.y + 50f) / 50 - 1;
            position.transform.localPosition = new Vector3(x * 37.5f - 37.5f, y * 37.5f + 37.5f, position.transform.localPosition.z);
        }
    }

    public void IncreaseCoins(float value) {
        coins += value;
        coinsText.text = "$" + coins;
    }

    public void UpdateCoins(float value) {
        coinsText.text = "$" + coins;
    }
}
